import mongoose, { Schema } from "mongoose";

interface Branch {
    name: string;
    tutorial: Schema.Types.ObjectId;
    address: string;
}

const BranchSchema = new Schema<Branch>(
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