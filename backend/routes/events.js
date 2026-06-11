import express from 'express'
import { Event } from '../models/Event.js'

const router = express.Router()

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 })
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      })
    }
    res.status(200).json({
      success: true,
      data: event
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create event
router.post('/', async (req, res) => {
  try {
    console.log('📨 Received event data:', req.body)
    const event = await Event.create(req.body)
    console.log('✅ Event created successfully:', event)
    res.status(201).json({
      success: true,
      data: event
    })
  } catch (error) {
    console.error('❌ Error creating event:', error.message)
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      })
    }
    res.status(200).json({
      success: true,
      data: event
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      })
    }
    res.status(200).json({
      success: true,
      data: {}
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
