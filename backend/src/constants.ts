interface options {
    httpOnly: Boolean;
    secure: Boolean;
    sameSite: String;
}

export const DB_NAME : string  = 'nstHelper';

export const options: options = {
    httpOnly: true,
    secure: true,
    sameSite: "None"
}