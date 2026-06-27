import mongoose, { Schema, Document, Model, Types, HydratedDocument } from 'mongoose';

interface ICounter  {
  id: Types.ObjectId;  
  seq: number;
}

export type ICounterDocument = HydratedDocument<ICounter>
const CounterSchema: Schema<ICounter, Model<ICounter>> = new Schema({
  id: { 
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true, 
        unique: true 
    },
  seq: {
        type: Number, 
        default: 0 
    }
});


const Counter = mongoose.model('Counter', CounterSchema);

export default Counter;