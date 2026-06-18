import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import studentRoutes from './routes/students.js'
import eventRoutes from './routes/events.js'
import feeRoutes from './routes/fees.js'

dotenv.config()

const app = express()

// ✅ CRITICAL: Enable CORS for frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://school-manager-ashen.vercel.app',
    'https://stepup-school-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB Atlas connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

connectDB()

// Routes
app.use('/api/students', studentRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/fees', feeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Network access: http://<YOUR_LAN_IP>:${PORT}`)
  console.log(`Available at your primary URL https://stepup-school-backend.onrender.com`)
})