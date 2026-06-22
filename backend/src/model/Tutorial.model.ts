import mongoose, {Model, Schema, Types} from "mongoose";


interface Tutorial {
    name: string;
    owner: Types.ObjectId;
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