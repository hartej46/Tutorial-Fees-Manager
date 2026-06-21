import { options } from "../constants";
import { User, UserType } from "../model/User.model";
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

const createUser = asyncHandler(async(req:Request, res: Response) : Promise<Response> => {
    const { name , email, password} = req.body;
    if (!name.trim() || !email.trim() || !password.trim()) return res.status(400).json({
                                                                                        success: false,
                                                                                        message: "Please give correct input."
                                                                                    });

    const user = await User.findOne({email: email})
    if (user) return res.status(409).json({
                                            success: false,
                                            message: "User already exist"
                                        });
    
    const newUser: UserType = await User.create({
                                name,
                                email,
                                password
                            });

    if (!newUser) return res.status(500).json({success: false, message: "Something went wrong internally."});

    const { refreshToken, accessToken } = await createRefreshAccessToken(newUser._id as Types.ObjectId);
    newUser.refreshToken = refreshToken;
    await newUser.save();
    return res.status(200).json({success: true, message: "User created successfully"})
})

const login = asyncHandler( async(req:Request, res: Response) : Promise<Response> => {
    const {email , password} = req.body;
    const user = await User.findOne({email: email});

    if (!user) return res.status(401).json({success: false, message: "Wrong email id, pls check again"});
    
    const isPasswordCorrect = user.isPasswordCorrect(password);

    if (!isPasswordCorrect) return res.status(401).json({success: false, message: "Password is incorrect"});

    const { refreshToken, accessToken } : token = await createRefreshAccessToken(user._id as Types.ObjectId);
    res.cookie('accessToken', accessToken, options).cookie("refreshToken", refreshToken, options);

    return res.status(200).json({
                                success: true,
                                message: "Logged in SuccessFully"
                            });
})

export {
    createRefreshAccessToken,
    login
}