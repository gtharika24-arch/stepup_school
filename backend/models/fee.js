import mongoose from 'mongoose'

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    studentName: {
      type: String,
      trim: true
    },
    classLevel: {
      type: String,
      enum: ['PreKG', 'LKG', 'UKG'],
      required: true
    },
    month: {
      type: String,
      required: [true, 'Please provide a fee month'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide a payment date']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a fee amount'],
      min: [0, 'Amount cannot be negative']
    }
  },
  {
    timestamps: true
  }
)

export const Fee = mongoose.model('Fee', feeSchema)
