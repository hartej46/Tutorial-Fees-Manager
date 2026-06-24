import {Branch} from '../model/Branch.model';
import { Standard} from '../model/Standard.model';
import { Tutorial } from '../model/Tutorial.model';
import { asyncHandler } from '../utils/asyncHandler';
import  {Types}  from 'mongoose';
import {Request, Response} from 'express';

interface CustomRequest extends Request {
    user? : {
        _id: Types.ObjectId;
        email: string;
        name: string;
    }
}

import Counter from '../model/URN.model';
import { Student } from '../model/Student.model';

async function getNextSequenceValue(counterId: string): Promise<number> {
    const sequenceDocument = await Counter.findOneAndUpdate(
        { id: counterId },
        { $inc: { seq: 1 } },
        { 
            new: true,
            upsert: true 
        }
    );

    return sequenceDocument.seq;
}

const createStudent = asyncHandler(async (req: CustomRequest, res: Response)=> {
    const {inputBranchName, inputStudent, inputYear, inputTutorialName, inputStandard, inputParentsPhoneNumber} = req.body;
    const [trimmedBranch, trimmedStudent, trimmedYear, trimmedTutorial, trimmedStandard, parentsPhoneNumberStr] = 
        [inputBranchName, inputStudent, inputYear, inputTutorialName, inputStandard, inputParentsPhoneNumber].map((item) => 
            typeof item === 'string' ? item.trim() : ""
        );

    const parentsPhoneNumber = Number(parentsPhoneNumberStr);
    const isPhoneValid = !isNaN(parentsPhoneNumber) && parentsPhoneNumberStr.length === 10;

    const correctInput = [trimmedBranch, trimmedStudent, trimmedYear, trimmedTutorial, trimmedStandard].every(item => item !== "") && isPhoneValid;

    if (!correctInput) return res.status(409).json({
        success: false,
        message: "Please provide correct input"
    });

    const tutorial = await Tutorial.findOne({name: trimmedTutorial, owner: req.user?._id});
    if (!tutorial) return res.status(409).json({
        success: false,
        message: "Tutorial not found"
    });

    const branch = await Branch.findOne({tutorial: tutorial._id, branchName: trimmedBranch});
    if (!branch) return res.status(409).json({
        success: false,
        message: "Branch not found"
    });

    const standard = await Standard.findOne({branch: branch._id, grade: trimmedStandard, year: trimmedYear});
    if (!standard) return res.status(409).json({
        success: false,
        message: "Standard not found"
    });

    const counterId = `${branch.branchName}-${trimmedYear}`;
    const seq = await getNextSequenceValue(counterId);
    const studentId = `${counterId}-${seq}`

    try {
        const newStudent = await Student.create({
            name: trimmedStudent,
            id: studentId,
            parentsPhoneNumber: parentsPhoneNumber
        });

        return res.status(200).json({
            success: true,
            message: "Student added successfully",
            data: newStudent
        });
    } catch (error : unknown) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error during creation"
        });
    }   
});