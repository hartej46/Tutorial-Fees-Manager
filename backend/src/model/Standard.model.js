import mongoose, { Schema } from "mongoose";

const StandardSchema = new Schema(
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
        applicableMonths: [{ 
            type: String, 
            enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }]
    }, 
    {
        timestamps: true
    }
);

export const Standard = mongoose.model("Standard", StandardSchema);