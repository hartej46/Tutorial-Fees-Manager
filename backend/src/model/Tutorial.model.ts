import mongoose, {Model, Schema} from "mongoose";

interface Tutorial {
    name: string;
    owner: Schema.Types.ObjectId;
}

const TutorialSchema = new Schema<Tutorial , Model<Tutorial , object>>(
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