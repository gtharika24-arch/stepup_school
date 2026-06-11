import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Please provide an event date']
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

export const Event = mongoose.model('Event', eventSchema)
