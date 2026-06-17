import express from 'express'
import { Fee } from '../models/fee.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const fees = await Fee.find().sort({ date: 1 })
    res.status(200).json({ success: true, count: fees.length, data: fees })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee entry not found' })
    }
    res.status(200).json({ success: true, data: fee })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const fee = await Fee.create(req.body)
    res.status(201).json({ success: true, data: fee })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee entry not found' })
    }
    res.status(200).json({ success: true, data: fee })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id)
    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee entry not found' })
    }
    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
