import mongoose, { Schema } from "mongoose";

const BranchSchema = new Schema(
    {
        name: {
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

export const Branch = mongoose.model("Branch", BranchSchema)