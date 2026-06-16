import mongoose, { model, Schema } from "mongoose";

const StudentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        parentsPhoneNumber: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }
)

export const Student = model("Student", StudentSchema)