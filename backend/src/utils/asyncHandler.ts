import { Request , Response, NextFunction,} from 'express';

export const asyncHandler = (
    fn : (req : Request, res : Response, next : NextFunction) => Promise<any>
): ((req : Request, res : Response, next : NextFunction) => Promise<any>) => {
    return async (req : Request, res : Response, next : NextFunction) => {
        try {
            return await fn (req, res, next)
        } catch (error : any) {
            const status = error.statusCode || error.status || 500;
            console.error(error);
            return res.status(status).json({
                success: false,
                message: error.message || 'Something went wrong',
            });
        }
    }
}