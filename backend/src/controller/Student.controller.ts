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

const createStudent = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { inputStudent, inputParentsPhoneNumber } = req.body;
    
    const trimmedStudent = typeof inputStudent === 'string' ? inputStudent.trim() : "";
    const parentsPhoneNumberStr = typeof inputParentsPhoneNumber === 'string' ? inputParentsPhoneNumber.trim() : "";

    const parentsPhoneNumber = Number(parentsPhoneNumberStr);
    const isPhoneValid = !isNaN(parentsPhoneNumber) && parentsPhoneNumberStr.length === 10;

    const correctInput = trimmedStudent !== "" && isPhoneValid;

    if (!correctInput) {
        return res.status(409).json({
            success: false,
            message: "Please provide correct input"
        });
    }

    try {
        const newStudent = await Student.create({
            name: trimmedStudent,
            parentsPhoneNumber: parentsPhoneNumber
        });

        return res.status(200).json({
            success: true,
            message: "Student added successfully",
            data: newStudent
        });
    } catch (error: unknown) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error during creation"
        });
    }   
});

export {
    createStudent
}