import mongoose, { Schema, Types, Model } from "mongoose";

interface Branch {
    branchName: string;
    tutorial: Types.ObjectId;
    address: string;
}

const BranchSchema = new Schema<Branch, Model<Branch, object>>(
    {
        branchName: {
            type: String,
            required: true
        },
        tutorial: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tutorial",
            required: true
        },
        address: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

BranchSchema.index({ tutorial: 1, branchName: 1 }, { unique: true });

export const Branch = mongoose.model("Branch", BranchSchema)