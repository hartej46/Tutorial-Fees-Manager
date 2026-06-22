import { Request, Response } from 'express';
import { Branch } from '../model/Branch.model';
import { Tutorial } from '../model/Tutorial.model'
import { asyncHandler } from '../utils/asyncHandler';
import { Types } from 'mongoose';

interface CustomRequest extends Request {
    user?: {
        _id: Types.ObjectId;
        email: string,
        name: string;
    };
}

const createBranch = asyncHandler(async (req: CustomRequest, res: Response): Promise<Response> => {
    const { branchName, address, tutorialName } = req.body;

    const trimmedBranchName = typeof branchName === 'string' ? branchName.trim() : '';
    const trimmedAddress = typeof address === 'string' ? address.trim() : '';
    const trimmedTutorialName = typeof tutorialName === 'string' ? tutorialName.trim() : '';

    if (!trimmedBranchName || !trimmedAddress || !trimmedTutorialName) {
        return res.status(400).json({
            success: false,
            message: "Branch name, address, and tutorial name are required."
        });
    }

    const tutorial = await Tutorial.findOne({
        owner: req.user?._id,
        name: trimmedTutorialName
    });
    if (!tutorial) {
        return res.status(404).json({
            success: false,
            message: "The specified tutorial was not found. Please create the tutorial first."
        });
    }

    const existedBranch = await Branch.findOne({
        tutorial: tutorial._id,
        branchName: trimmedBranchName
    });
    if (existedBranch) {
        return res.status(409).json({ 
            success: false,
            message: "A branch with this name already exists for this tutorial.",
            data: existedBranch
        });
    }

    try {
        const newBranch = await Branch.create({
            branchName: trimmedBranchName,
            tutorial: tutorial._id,
            address: trimmedAddress
        });

        return res.status(201).json({
            success: true,
            message: "Branch structure instantiated successfully.",
            data: newBranch
        });
    } catch (error: unknown) {
        const err = error as { code?: number; name?: string };
        if (err.code === 11000 || err.name === 'MongoServerError') {
            return res.status(409).json({
                success: false,
                message: "A branch with this name already exists for this tutorial."
            });
        }

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred while instantiating the branch metadata."
        });
    }
});
