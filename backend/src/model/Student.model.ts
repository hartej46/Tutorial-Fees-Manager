import mongoose, { model, Schema } from "mongoose";

interface Student {
    name: string;
    parentsPhoneNumber: Number;
}

const StudentSchema = new Schema<Student>(
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