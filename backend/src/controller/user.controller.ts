import { create } from "axios";
import { User } from "../model/User.model";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Types } from "mongoose";

interface token {
    refreshToken : string;
    accessToken : string
}

interface CustomRequest extends Request {
  user?: any;
}

const createRefreshAccessToken = async (id : Types.ObjectId) : Promise<token>  => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");               // probably will never get into this error , coz i have check multiple time before coming here
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { refreshToken, accessToken };
}

const login = asyncHandler( async(req:Request, res: Response) : Promise<any> => {
    const {email , password} = req.body;
    const user = await User.findOne({email: email});

    if (!user) return res.status(401).json({success: false, message: "Wrong email id, pls check again"});
    
    const isPasswordCorrect = user.isPasswordCorrect(password);

    if (!isPasswordCorrect) return res.status(401).json({success: false, message: "Password is incorrect"});

    const { refreshToken, accessToken } : token = await createRefreshAccessToken(user._id as Types.ObjectId)
})

export {
    createRefreshAccessToken,
    login
}