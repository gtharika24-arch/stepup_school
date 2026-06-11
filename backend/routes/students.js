import express from 'express'
import { Student } from '../models/Student.js'

const router = express.Router()

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get students by class
router.get('/class/:classLevel', async (req, res) => {
  try {
    const students = await Student.find({ classLevel: req.params.classLevel }).sort({ rollNo: 1 })
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      })
    }
    res.status(200).json({
      success: true,
      data: student
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create student
router.post('/', async (req, res) => {
  try {
    const student = await Student.create(req.body)
    res.status(201).json({
      success: true,
      data: student
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      })
    }
    res.status(200).json({
      success: true,
      data: student
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
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
