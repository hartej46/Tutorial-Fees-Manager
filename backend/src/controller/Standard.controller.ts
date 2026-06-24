import { Request, Response} from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { Types } from 'mongoose';
import { Tutorial } from '../model/Tutorial.model.ts';
import { Branch } from '../model/Branch.model.ts';
import { Standard } from '../model/Standard.model.ts';


interface CustomRequest extends Request {
    user? : {
        _id: Types.ObjectId;
        email: string;
        name: string;
    }
}

const createNewClass = asyncHandler(async (req: CustomRequest, res: Response) : Promise<Response> => {
    const { tutorialName, branchName, receivedStandard, applicableMonths, totalFeeAmount, year } = req.body;
    
    const trimmedTutorialName = typeof tutorialName === 'string' ? tutorialName.trim() : "";
    const trimmedBranchName = typeof branchName === 'string' ? branchName.trim() : "";
    const trimmedYear = typeof year === 'string' ? year.trim() : "";

    const isInvalidType = typeof tutorialName !== 'string' || typeof branchName !== 'string' || typeof totalFeeAmount !== 'number' || typeof year !== 'string';
    const isMissingRequired = !trimmedTutorialName || !trimmedBranchName || !receivedStandard || !trimmedYear;
    const isInvalidMonths = !applicableMonths || !Array.isArray(applicableMonths) || applicableMonths.length === 0;

    if (isInvalidType || isMissingRequired || isInvalidMonths) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid input"
        });
    }

    const tutorial = await Tutorial.findOne({ owner: req.user?._id, name: trimmedTutorialName });
    if (!tutorial) {
        return res.status(400).json({
            success: false,
            message: "Tutorial not found"
        });
    }

    const branch = await Branch.findOne({ branchName: trimmedBranchName, tutorial: tutorial._id as Types.ObjectId });
    if (!branch) {
        return res.status(409).json({
            success: false,
            message: "Bro what are you doing, no branch found"
        });
    }

    const standard = String(receivedStandard).toLowerCase();

    const existedStandard = await Standard.findOne({
        grade: standard,
        year: trimmedYear,
        branch: branch._id as Types.ObjectId
    });

    if (existedStandard) {
        return res.status(400).json({
            success: false,
            message: `Standard '${standard}' for the year '${trimmedYear}' already exists in this branch.`
        });
    }

    try {
        const newStandard = await Standard.create({
            grade: standard,
            year: trimmedYear,
            branch: branch._id as Types.ObjectId,
            applicableMonths: applicableMonths,
            totalFeeAmount: totalFeeAmount
        });

        return res.status(201).json({
            success: true,
            message: "Class standard created successfully",
            data: newStandard
        });
        
    } catch (error: unknown) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal Server Error during creation"
        });
    }
});

const getAllClass = asyncHandler(async(req: CustomRequest, res: Response) => {
    const {inputBranch, inputTutorial, inputYear, inputStandard} = req.body;
    const [trimmedBranch, trimmedYear, trimmedStandard,trimmedTutorial] = [inputBranch, inputYear, inputStandard,inputTutorial].map((item) => 
        typeof item === 'string' ? item.trim() : ""
    );

    const correctInput = [trimmedBranch, trimmedYear, trimmedStandard,trimmedTutorial].every(item => item !== "");

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

    const standard = await Standard.findOne({branch: branch._id, grade: trimmedStandard, year: trimmedYear})

    return res.status(200).json({
        success: true,
        message: "Found successfully",
        data: standard
    })
})

export {
    createNewClass,
    getAllClass
}