import mongoose, { Schema } from "mongoose";

const montlySchema = new Schema(
    {
        monthName: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending','paid','partially paid'],
            default: "pending"
        },
        paymentDate: {
            type: String,
            required: true
        },
        amountPaid: {
            type: String,
            required: true,
            default: 0,
            min: 0
        }
    }
)

const EnrollmentSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student"
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: "Branch"
        },
        grade: {
            type: Schema.Types.ObjectId,
            ref: "Standard"
        },
        year: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: false
        },
        montlyFeeStructure: [montlySchema]
    }
)

exports = mongoose.model('Enrollment', EnrollmentSchema);