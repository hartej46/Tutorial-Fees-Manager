import { options } from "../constants.ts";
import { createRefreshAccessToken } from "../controller/user.controller.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from '../model/User.model.ts'
import { asyncHandler } from "../utils/asyncHandler.ts";
import { Response, Request, NextFunction } from "express";
import { UserType } from "../model/User.model.ts";

interface TokenPayload extends JwtPayload {
  _id: string;
}

interface CustomRequest extends Request {
  user?: UserType;
}


export const verifyToken = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken;
        
        if (!token) {
            return res.status(401)
                .clearCookie("accessToken") 
                .json({
                    success: false,
                    message: "Unauthorized access. Please login again"
                });
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_GENERATOR as string) as TokenPayload;
        const user = await User.findById(decodeToken._id);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }
        
        req.user = user;
        return next();

    } catch (error: any) {
        const rToken = req.cookies?.refreshToken;
        if ((error.name === "TokenExpiredError" || error.message === "TokenExpired") && rToken) {
            try {
                const decodeToken = jwt.verify(rToken, process.env.REFRESH_TOKEN_GENERATOR as string) as TokenPayload;
                const user = await User.findById(decodeToken._id);
                
                if (!user) {
                    return res.status(401)
                        .clearCookie('accessToken')
                        .json({
                            success: false,
                            message: "Unauthorized access. Please login again"
                        });
                }
                
                const {accessToken, refreshToken} = await createRefreshAccessToken(user._id);
                res.cookie('accessToken', accessToken, options).cookie("refreshToken", refreshToken, options);
                
                req.user = user;
                return next();
            } catch (refreshError: any) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Refresh token invalid or expired. Please login again." 
                });
            }
        }
        return res.status(401).json({ 
            success: false, 
            message: "Invalid token. Please login again." 
        });
    } 
});