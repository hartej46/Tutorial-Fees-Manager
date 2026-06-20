import { options } from "../constants.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from '../model/User.model.ts'
import { asyncHandler } from "../utils/asyncHandler.ts";
import { Response, Request, NextFunction } from "express";

interface TokenPayload extends JwtPayload {
  _id: string;
}

export const verifyToken = asyncHandler(async(req: Request, res: Response, next: NextFunction) : Promise<any> => {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401)
                            .clearCookie("token") 
                            .json({
                                success: false,
                                message: "Unauthorized access. Please login again"
                            })

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_GENERATOR as string) as TokenPayload;
    const user = await User.findById(decodeToken._id);
})