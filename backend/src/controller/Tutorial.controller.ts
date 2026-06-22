import { Request, Response } from "express";
import { Tutorial } from "../model/Tutorial.model";
import { asyncHandler } from "../utils/asyncHandler";
import { Types } from "mongoose";

interface CustomRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    email: string;
    name: string;
  };
}

const createTutorial = asyncHandler(async (req: CustomRequest, res: Response): Promise<Response> => {
    const { name } = req.body;
    if (!req.user || !req.user._id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized request. User authentication missing."
        });
    }
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid tutorial name."
        });
    }
    const existingTutorial = await Tutorial.findOne({ owner: req.user._id });
    if (existingTutorial) {
        return res.status(409).json({
            success: false,
            message: "You have already created a tutorial profile. Multi-tenant tutorial hosting requires account upgrades."
        });
    }

    const newTutorial = await Tutorial.create({
        name: name.trim(),
        owner: req.user._id
    });

    if (!newTutorial) {
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred while instantiating the tutorial metadata."
        });
    }

    return res.status(201).json({
        success: true,
        message: "Tutorial structure instantiated successfully.",
        data: newTutorial
    });
});

const getMyTutorialProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<Response> => {
        if (!req.user || !req.user._id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized request."
        });
    }

    const tutorial = await Tutorial.findOne({ owner: req.user._id }).populate("owner", "-password -refreshToken");

    if (!tutorial) {
        return res.status(404).json({
            success: false,
            message: "No tutorial registration details found for this active user identity.",
            hasSetupTutorial: false
        });
    }

    return res.status(200).json({
        success: true,
        message: "Tutorial configuration payload resolved successfully.",
        data: tutorial,
        hasSetupTutorial: true
    });
});

export {
    createTutorial,
    getMyTutorialProfile
};