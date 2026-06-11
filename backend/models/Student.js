import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a student name'],
      trim: true
    },
    classLevel: {
      type: String,
      enum: ['PreKG', 'LKG', 'UKG'],
      required: true
    },
    dob: {
      type: Date,
      required: true
    },
    fatherName: {
      type: String,
      trim: true
    },
    fatherPhone: {
      type: String,
      trim: true
    },
    fatherDob: {
      type: Date
    },
    motherName: {
      type: String,
      trim: true
    },
    motherPhone: {
      type: String,
      trim: true
    },
    motherDob: {
      type: Date
    },
    parentsAnniversary: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

export const Student = mongoose.model('Student', studentSchema)
