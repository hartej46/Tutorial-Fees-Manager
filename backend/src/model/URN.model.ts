import mongoose, { Schema, Document, Model, HydratedDocument } from 'mongoose';

interface ICounter  {
  id: string;  
  seq: number;
}

export type ICounterDocument = HydratedDocument<ICounter>
const CounterSchema: Schema<ICounter, Model<ICounter>> = new Schema({
  id: { 
        type: String,
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