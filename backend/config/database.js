import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ override: true })

const FALLBACK_URI = 'mongodb://127.0.0.1:27017/student_management'

export const getMongoUri = () => {
  const configuredUri = process.env.MONGODB_URI || FALLBACK_URI
  const isAtlasUri = configuredUri.startsWith('mongodb+srv://')
  const hasPlaceholderCredentials = /<username>|<password>|YOUR_USERNAME|YOUR_PASSWORD|username:password/i.test(configuredUri)

  if (hasPlaceholderCredentials && isAtlasUri) {
    throw new Error('MongoDB Atlas URI still contains placeholder credentials. Replace <username> and <password> in backend/.env with your real Atlas username and password.')
  }

  return configuredUri
}

export const connectDB = async () => {
  const uriToUse = getMongoUri()
  const isAtlasUri = uriToUse.startsWith('mongodb+srv://')
  const hasPlaceholderCredentials = /<username>|<password>|YOUR_USERNAME|YOUR_PASSWORD|username:password/i.test(uriToUse)

  try {
    await mongoose.connect(uriToUse, {
      serverSelectionTimeoutMS: 30000,
      autoIndex: true
    })

    if (isAtlasUri && !hasPlaceholderCredentials) {
      console.log('MongoDB Atlas connected successfully')
    } else {
      console.log('MongoDB connected successfully')
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}
