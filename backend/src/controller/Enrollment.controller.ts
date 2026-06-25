import Enrollment from '../model/Enrollment.model';
import {Branch} from '../model/Branch.model';
import { Student } from '../model/Student.model.ts';
import { Standard} from '../model/Standard.model';
import { Tutorial } from '../model/Tutorial.model';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { Request, Response} from 'express';
import { Types } from 'mongoose';

interface CustomRequest extends Request {
    user? : {
        _id: Types.ObjectId;
        email: string;
        name: string;
    }
}


const createNewEnrollment = asyncHandler(async(req: CustomRequest, res: Response) => {
    const { inputBranchName, inputTutorialName, inputStudentId, inputStandard, inputYear } = req.body;
    const [branchName, tutorialName, studentId, standard, year ] = [inputBranchName, 
                                                                    inputTutorialName,
                                                                    inputStudentId, 
                                                                    inputStandard, 
                                                                    inputYear].map(item =>( 
                                                                    typeof(item) == 'string' ? item.trim() : ""
                                                                    ));
        
    const correctInput = [  branchName, 
                            tutorialName, 
                            studentId, 
                            standard, 
                            year 
                        ].every(item => item !== "");
        
    if (!correctInput) {
        return res.status(400).json({
            success: false,
            message: "Provide correct input"
        });
    }

    const tutorial = await Tutorial.findOne({name: tutorialName, owner: req.user?._id});
    if (!tutorial) {
        return res.status(404).json({
            success: false,
            message: "Tutorial not found"
        });
    }

    const branch = await Branch.findOne({tutorial: tutorial._id, branchName: branchName});
    if (!branch) {
        return res.status(404).json({
            success: false,
            message: "Bro what are you doing, no branch found"
        });
    }

    const existedStandard = await Standard.findOne({
        grade: standard.toLocaleLowerCase(),
        year: year,
        branch: branch._id as Types.ObjectId
    });

    if (!existedStandard) {
        return res.status(404).json({
            success: false,
            message: `Standard not found`
        });
    }

    const student = await Student.findOne({id: studentId as string});
    if (!student) {
        return res.status(400).json({
            success: false,
            message: `Student not found`
        });
    }

    const existingEnrollment = await Enrollment.findOne({
        student: student._id,
        branch: branch._id,
        grade: existedStandard._id,
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
        student: student._id,
        branch: branch._id,
        grade: existedStandard._id,
        year: year,
        isActive: true,
        monthlyFeeStructure: initialFeeStructure
    });

    return res.status(201).json({
        success: true,
        message: "Student enrolled successfully!",
        data: newEnrollment
    });
})