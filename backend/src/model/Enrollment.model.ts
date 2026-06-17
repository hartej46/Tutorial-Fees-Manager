import { Schema, model, Types } from 'mongoose';

interface Montly {
  monthName: string;
  status: 'pending' | 'paid' | 'partially paid';
  paymentDate: Date;
  amountPaid: number;
}

interface EnrollmentSchemaDocument extends Montly {
  student: Types.ObjectId;
  branch: Types.ObjectId;
  grade: Types.ObjectId;
  year: string;
  isActive: boolean;
  montlyFeeStructure: Montly[];
}

const montlySchema = new Schema<Montly>({
  monthName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partially paid'],
    default: 'pending',
  },
  paymentDate: { type: Date, required: true },
  amountPaid: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const EnrollmentSchema = new Schema<EnrollmentSchemaDocument>({
  student: { type: Types.ObjectId, ref: 'Student' },
  branch: { type: Types.ObjectId, ref: 'Branch' },
  grade: { type: Types.ObjectId, ref: 'Standard' },
  year: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  montlyFeeStructure: [montlySchema],
});

const Enrollment = model<EnrollmentSchemaDocument>('Enrollment', EnrollmentSchema);

export default Enrollment;
