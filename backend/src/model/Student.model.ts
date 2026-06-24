import mongoose, { Model, model, Schema } from "mongoose";

interface Student {
    name: string;
    parentsPhoneNumber: Number;
    id: string
}

const StudentSchema = new Schema<Student, Model<Student, object>>(
    {
        name: {
            type: String,
            required: true,
        },
        parentsPhoneNumber: {
            type: Number,
            required: true
        },
        id: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Student = model("Student", StudentSchema)