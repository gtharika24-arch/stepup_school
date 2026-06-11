# School Management System - Backend

A Node.js/Express backend with MongoDB for managing school students and events.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/school_manager
PORT=5000
NODE_ENV=development
```

## Running MongoDB

### Windows with MongoDB installed locally

```bash
mongod
```

### Using MongoDB Atlas (Cloud)

Update your `.env` file with your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_manager
```

## Development

Start the development server with auto-reload:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

## Production

Start the production server:
```bash
npm start
```

## Seed Database

To populate the database with sample data:
```bash
node seed.js
```

## API Endpoints

### Students

- **GET** `/api/students` - Get all students
- **GET** `/api/students/class/:classLevel` - Get students by class (PreKG, LKG, UKG)
- **GET** `/api/students/:id` - Get a specific student
- **POST** `/api/students` - Create a new student
- **PUT** `/api/students/:id` - Update a student
- **DELETE** `/api/students/:id` - Delete a student

### Events

- **GET** `/api/events` - Get all events
- **GET** `/api/events/:id` - Get a specific event
- **POST** `/api/events` - Create a new event
- **PUT** `/api/events/:id` - Update an event
- **DELETE** `/api/events/:id` - Delete an event

### Health Check

- **GET** `/api/health` - Check server status

## Project Structure

```
backend/
├── config/
│   └── database.js      # MongoDB connection
├── models/
│   ├── Student.js       # Student schema
│   └── Event.js         # Event schema
├── routes/
│   ├── students.js      # Student routes
│   └── events.js        # Event routes
├── server.js            # Express server setup
├── seed.js              # Database seeding script
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
└── package.json         # Dependencies
```

## Models

### Student Model
- name (required)
- classLevel (PreKG, LKG, UKG)
- rollNo
- dob (Date of Birth)
- fatherName
- fatherPhone
- fatherDob
- motherName
- motherPhone
- motherDob
- parentsAnniversary

### Event Model
- title (required)
- date (required)
- description

## Example Requests

### Create a Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "classLevel": "PreKG",
    "rollNo": "001",
    "dob": "2021-03-15",
    "fatherName": "James Doe",
    "fatherPhone": "9876543210",
    "fatherDob": "1990-05-10",
    "motherName": "Jane Doe",
    "motherPhone": "9876543211",
    "motherDob": "1992-08-20",
    "parentsAnniversary": "2015-06-15"
  }'
```

### Get Students by Class
```bash
curl http://localhost:5000/api/students/class/PreKG
```

### Create an Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Annual Day",
    "date": "2026-08-15",
    "description": "School annual celebration"
  }'
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your MongoDB URI in .env
- Verify network connectivity if using MongoDB Atlas

### CORS Errors
- The backend is configured to accept requests from localhost:3000 and localhost:3001
- Update `server.js` to add more allowed origins if needed

## License

MIT
