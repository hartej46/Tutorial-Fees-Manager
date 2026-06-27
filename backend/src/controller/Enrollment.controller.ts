import Enrollment from '../model/Enrollment.model';
import { Branch } from '../model/Branch.model';
import { Student } from '../model/Student.model.ts';
import { Standard } from '../model/Standard.model';
import { Tutorial } from '../model/Tutorial.model';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

interface CustomRequest extends Request {
    user? : {
        _id: Types.ObjectId;
        email: string;
        name: string;
    }
}

interface ValidateEntitiesParams {
    tutorialName: string;
    branchName: string;
    standard: string;
    year: string;
    studentId: string;
    userId?: Types.ObjectId;
}

const validateEnrollmentEntities = async ({
    tutorialName,
    branchName,
    standard,
    year,
    studentId,
    userId
}: ValidateEntitiesParams) => {
    const tutorial = await Tutorial.findOne({ name: tutorialName, owner: userId });
    if (!tutorial) {
        return { isValid: false, status: 404, message: "Tutorial not found" };
    }

    const branch = await Branch.findOne({ tutorial: tutorial._id, branchName: branchName });
    if (!branch) {
        return { isValid: false, status: 404, message: "Bro what are you doing, no branch found" };
    }

    const existedStandard = await Standard.findOne({
        grade: standard.toLocaleLowerCase(),
        year: year,
        branch: branch._id as Types.ObjectId
    });
    if (!existedStandard) {
        return { isValid: false, status: 404, message: "Standard not found" };
    }

    const student = await Student.findOne({ id: studentId });
    if (!student) {
        return { isValid: false, status: 400, message: "Student not found" };
    }

    return {
        isValid: true,
        data: {
            studentDbId: student._id,
            branchDbId: branch._id,
            standardDbId: existedStandard._id
        }
    };
};

const createNewEnrollment = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { inputBranchName, inputTutorialName, inputStudentId, inputStandard, inputYear } = req.body;
    const [branchName, tutorialName, studentId, standard, year] = [
        inputBranchName,
        inputTutorialName,
        inputStudentId,
        inputStandard,
        inputYear
    ].map(item => (typeof item == 'string' ? item.trim() : ""));

    const correctInput = [branchName, tutorialName, studentId, standard, year].every(item => item !== "");

    if (!correctInput) {
        return res.status(400).json({
            success: false,
            message: "Provide correct input"
        });
    }

    const validation = await validateEnrollmentEntities({
        tutorialName,
        branchName,
        standard,
        year,
        studentId,
        userId: req.user?._id
    });

    if (!validation.isValid || !validation.data) {
        return res.status(validation.status || 400).json({
            success: false,
            message: validation.message
        });
    }

    const { studentDbId, branchDbId, standardDbId } = validation.data;

    const existingEnrollment = await Enrollment.findOne({
        student: studentDbId,
        branch: branchDbId,
        grade: standardDbId,
        year: year
    });

    if (existingEnrollment) {
        return res.status(409).json({
            success: false,
            message: "Student is already enrolled in this standard for the given academic year."
        });
    }

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const initialFeeStructure = months.map(month => ({
        monthName: month,
        status: 'pending' as const,
        paymentDate: new Date(),
        amountPaid: 0
    }));
    const newEnrollment = await Enrollment.create({
        student: studentDbId,
        branch: branchDbId,
        grade: standardDbId,
        year: year,
        isActive: true,
        monthlyFeeStructure: initialFeeStructure
    });

    return res.status(201).json({
        success: true,
        message: "Student enrolled successfully!",
        data: newEnrollment
    });
});

const updateStudentMonthlyFees = asyncHandler(async (req: CustomRequest, res: Response) => {
    const {
        inputBranchName,
        inputTutorialName,
        inputStudentId,
        inputStandard,
        inputYear,
        inputMonthName,
        inputStatus,
        inputAmountPaid,
    } = req.body;

    const [branchName, tutorialName, studentId, standard, year, monthName, status, amountPaidStr] = [
        inputBranchName,
        inputTutorialName,
        inputStudentId,
        inputStandard,
        inputYear,
        inputMonthName,
        inputStatus,
        inputAmountPaid
    ].map(item => (typeof item == 'string' ? item.trim() : ""));

    const correctInput = [branchName, tutorialName, studentId, standard, year, monthName, status, amountPaidStr].every(item => item !== "");

    if (!correctInput) {
        return res.status(400).json({
            success: false,
            message: 'Provide correct input'
        });
    }

    const amountPaid = parseFloat(amountPaidStr);
    if (isNaN(amountPaid)) {
        return res.status(400).json({
            success: false,
            message: 'Amount paid must be a valid number'
        });
    }

    const validation = await validateEnrollmentEntities({
        tutorialName,
        branchName,
        standard,
        year,
        studentId,
        userId: req.user?._id
    });

    if (!validation.isValid || !validation.data) {
        return res.status(validation.status || 400).json({
            success: false,
            message: validation.message
        });
    }

    const { studentDbId, branchDbId, standardDbId } = validation.data;

    const updatedEnrollment = await Enrollment.findOneAndUpdate(
        {
            student: studentDbId,
            branch: branchDbId,
            grade: standardDbId,
            year: year,
            "monthlyFeeStructure.monthName": { $regex: new RegExp(`^${monthName}$`, 'i') }
        },
        {
            $set: {
                "monthlyFeeStructure.$.status": status,
                "monthlyFeeStructure.$.amountPaid": amountPaid,
                "monthlyFeeStructure.$.paymentDate": new Date()
            }
        },
        { new: true }
    );

    if (!updatedEnrollment) {
        return res.status(404).json({
            success: false,
            message: "Enrollment record not found for this student setup."
        });
    }

    return res.status(200).json({
        success: true,
        message: "Fees updated successfully!",
        data: updatedEnrollment
    });
});