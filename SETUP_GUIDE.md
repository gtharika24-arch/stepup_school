# MongoDB + Backend Setup Complete ✅

## What's Been Set Up

### Backend (Node.js/Express with MongoDB)

**Files Created:**
- `backend/server.js` - Express server with CORS and routes
- `backend/config/database.js` - MongoDB connection configuration
- `backend/models/Student.js` - Mongoose Student schema
- `backend/models/Event.js` - Mongoose Event schema
- `backend/routes/students.js` - Student CRUD operations API
- `backend/routes/events.js` - Event CRUD operations API
- `backend/seed.js` - Database seeding script with sample data
- `backend/.env` - Environment variables configuration
- `backend/package.json` - Backend dependencies

**Dependencies Installed:**
- express - Web framework
- mongoose - MongoDB ODM
- cors - Cross-Origin Resource Sharing
- dotenv - Environment variable management
- nodemon - Development server with auto-reload

### Frontend Integration

**Files Created:**
- `src/utils/api.js` - API utility functions for frontend-backend communication

**Files Updated:**
- `src/context/AppContext.jsx` - Integrated with API endpoints
- `src/pages/StudentList.jsx` - Updated to use MongoDB data

## How to Get Started

### 1. Install MongoDB
- Download: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (Cloud): https://www.mongodb.com/cloud/atlas

### 2. Start MongoDB
```bash
mongod
```

### 3. Install Backend Dependencies (Already Done)
```bash
cd backend
npm install  # Already installed
```

### 4. Seed Database with Sample Data
```bash
cd backend
node seed.js
```

### 5. Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

### 6. Start Frontend Server
In a new terminal:
```bash
npm run dev
```
Frontend runs on: http://localhost:3001

## API Endpoints Available

### Students API
- `GET /api/students` - Get all students
- `GET /api/students/class/:classLevel` - Get students by class
- `GET /api/students/:id` - Get specific student
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Events API
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Environment Configuration

### Backend .env file (`backend/.env`)
```
MONGODB_URI=mongodb://localhost:27017/school_manager
PORT=5000
NODE_ENV=development
```

### For MongoDB Atlas (Cloud)
Replace MONGODB_URI with:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_manager
```

## Project Architecture

```
Frontend (React 18 + Vite)
    ↓ (API Calls via /src/utils/api.js)
Express Server (Node.js)
    ↓ (Mongoose)
MongoDB Database
```

## Data Models

### Student
- name, classLevel, rollNo, dob
- fatherName, fatherPhone, fatherDob
- motherName, motherPhone, motherDob
- parentsAnniversary

### Event
- title, date, description

## Key Features

✅ MongoDB persistence - Data survives page refresh
✅ RESTful API - Clean API architecture
✅ CORS enabled - Frontend-backend communication
✅ Auto-reload - Use nodemon for development
✅ Sample data - Seed script with 12 students and 4 events
✅ Error handling - Try-catch blocks on all operations
✅ Environment variables - Secure configuration

## Troubleshooting

### MongoDB not connecting?
1. Ensure mongod is running
2. Check connection string in .env
3. Default: mongodb://localhost:27017/school_manager

### API 404 errors?
1. Verify backend is running on port 5000
2. Check API URL in src/utils/api.js
3. Ensure CORS is configured correctly

### Students not loading?
1. Run `node seed.js` in backend folder
2. Check MongoDB is running
3. Verify network tab in browser DevTools

## Next Steps

1. Run MongoDB: `mongod`
2. Seed database: `cd backend && node seed.js`
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `npm run dev` (in new terminal)
5. Navigate to http://localhost:3001

## Support & Documentation

- Backend README: `backend/README.md`
- Frontend README: `README.md`
- API examples in backend README
