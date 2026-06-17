import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import studentRoutes from './routes/students.js'
import eventRoutes from './routes/events.js'
import feeRoutes from './routes/fees.js'

dotenv.config({ override: true })

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    'https://school-manager-liart.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}))
app.use(express.json())

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/students', studentRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/fees', feeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Network access: http://<YOUR_LAN_IP>:${PORT}`)
})
