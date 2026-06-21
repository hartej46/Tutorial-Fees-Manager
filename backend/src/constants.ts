import { CookieOptions } from "express";
export const DB_NAME : string  = 'nstHelper';

export const options: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
}