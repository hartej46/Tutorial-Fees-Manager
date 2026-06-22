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

    if (!branchName?.trim() || !address?.trim() || !tutorialName?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Branch name, address, and tutorial name are required."
        });
    }

    const trimmedBranchName = branchName.trim();
    const trimmedAddress = address.trim();

    const tutorial = await Tutorial.findOne({
        owner: req.user?._id,
        name: tutorialName
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

    const newBranch = await Branch.create({
        branchName: trimmedBranchName,
        tutorial: tutorial._id,
        address: trimmedAddress
    });
    if (!newBranch) {
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred while instantiating the branch metadata."
        });
    }

    return res.status(201).json({
        success: true,
        message: "Branch structure instantiated successfully.",
        data: newBranch
    });
});
