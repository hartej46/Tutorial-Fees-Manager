import mongoose, {Schema} from "mongoose";

const TutorialSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

export const Tutorial = mongoose.model("Tutorial", TutorialSchema);