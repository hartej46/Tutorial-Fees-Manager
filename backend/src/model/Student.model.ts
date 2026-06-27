import mongoose, { Model, model, Schema, Types } from "mongoose";

interface Student {
    name: string;
    parentsPhoneNumber: Number;
    id: string;
    owner: Types.ObjectId;
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
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Student = model("Student", StudentSchema)