# School Management System

A comprehensive school management application built with React 18, Node.js/Express, and MongoDB. Manage classes, students, events, and celebrations efficiently.

## Project Structure

```
school_manager/
├── src/                 # React Frontend
│   ├── pages/
│   ├── components/
│   ├── context/
│   ├── styles/
│   └── utils/
├── backend/             # Node.js/Express Backend
│   ├── config/
│   ├── models/
│   ├── routes/
│   └── server.js
├── package.json         # Frontend dependencies
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)

## Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Start MongoDB

**Windows:**
```bash
mongod
```

**Or use MongoDB Atlas (Cloud):**
- Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Update `backend/.env` with your connection string

### 4. Seed Database (Optional - Populates with sample data)

```bash
cd backend
node seed.js
cd ..
```

### 5. Start Backend Server

In a new terminal:
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 6. Start Frontend Development Server

In another terminal:
```bash
npm run dev
```

Frontend will run on `http://localhost:3001`

## Features

### 🎓 Dashboard
- Class selection (PreKG, LKG, UKG)
- Event reminders (next 2 upcoming events)
- Birthday & Anniversary reminders (tomorrow and day after)
- Clean, intuitive interface

### 👥 Student Management
- View students by class in table format
- Add new students with complete information
- Track parent details and contact information
- Student date of birth and parents' anniversary
- MongoDB persistence

### 📅 Event Management
- View all school events
- Create new events
- Event dates and descriptions
- MongoDB storage

### 🎂 Celebrations
- Birthday tracking
- Anniversary reminders
- Smart filtering for upcoming celebrations

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/class/:classLevel` - Get students by class
- `GET /api/students/:id` - Get specific student
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Database Schema

### Student Model
```javascript
{
  name: String (required),
  classLevel: String (PreKG, LKG, UKG),
  rollNo: String,
  dob: Date,
  fatherName: String,
  fatherPhone: String,
  fatherDob: Date,
  motherName: String,
  motherPhone: String,
  motherDob: Date,
  parentsAnniversary: Date
}
```

### Event Model
```javascript
{
  title: String (required),
  date: Date (required),
  description: String
}
```

## Technologies Used

### Frontend
- **React 18** - UI library with Hooks
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **CSS3** - Modern styling with gradients and animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

### Database
- **MongoDB** - NoSQL database

## Project Features

✅ **Direct Dashboard Access** - No login required, directly access dashboard
✅ **Class Management** - Organize students by PreKG, LKG, UKG
✅ **Student Information** - Store complete parent and student details
✅ **Event Tracking** - Manage school events efficiently
✅ **Smart Reminders** - Birthday and event reminders with filtering
✅ **Real-time Data** - MongoDB ensures data persistence
✅ **Responsive UI** - Works on desktop, tablet, and mobile
✅ **RESTful API** - Clean API for all operations

## Environment Variables

Create `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/school_manager
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in `.env` file
- Verify port 27017 is not blocked

### CORS Errors
- Backend CORS is configured for localhost:3000 and localhost:3001
- Update `backend/server.js` to add more origins if needed

### API Connection Errors
- Ensure backend is running on port 5000
- Check that both frontend and backend are running
- Verify API URL in `src/utils/api.js`

### Port Already in Use
- Frontend: Change port in `vite.config.js`
- Backend: Update PORT in `backend/.env`

## Development Tips

1. **Use MongoDB Compass** - GUI tool for MongoDB management
2. **Check Console Logs** - Both frontend and backend have detailed logging
3. **API Testing** - Use Postman or curl for API testing
4. **Hot Reload** - Frontend has HMR, backend uses nodemon

## Future Enhancements

- User authentication
- Admin panel
- Attendance tracking
- Grade management
- Parent notifications
- Assignment system
- Student profiles
- Export to CSV/PDF
- Advanced reporting

## License

MIT

## Support

For issues or questions, please check the backend [README](./backend/README.md) for additional backend-specific information.
