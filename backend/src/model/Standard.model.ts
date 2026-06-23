import mongoose, { Schema, Types } from "mongoose";

interface Standard {
    grade: string;
    year: string;
    branch: Types.ObjectId;
    totalFeeAmount: Number;
    applicableMonths: String;
}

const StandardSchema = new Schema<Standard>(
    {
        grade: {
            type: String,
            required: true
        },
        year: {
            type: String,
            required: true,
            trim: true
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch"
        },
        totalFeeAmount: {
            type: Number,
            required: true,
        },
        applicableMonths: {
        type: [String], 
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        default: [] 
    }
    }, 
    {
        timestamps: true
    }
);

export const Standard = mongoose.model("Standard", StandardSchema);