import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { getMongoUri } from './config/database.js'
import { Student } from './models/Student.js'
import { Event } from './models/Event.js'

dotenv.config()

const seedDatabase = async () => {
  try {
    const uriToUse = getMongoUri()
    await mongoose.connect(uriToUse, {
      serverSelectionTimeoutMS: 30000,
      autoIndex: true
    })
    console.log('MongoDB connected')

    // Clear existing data
    await Student.deleteMany()
    await Event.deleteMany()

    // Sample students
    const students = [
      // PreKG
      {
        name: 'Ava Johnson',
        classLevel: 'PreKG',
        dob: new Date('2021-03-15'),
        fatherName: 'Robert Johnson',
        fatherPhone: '9876543210',
        fatherDob: new Date('1990-05-10'),
        motherName: 'Sarah Johnson',
        motherPhone: '9876543211',
        motherDob: new Date('1992-08-20'),
        parentsAnniversary: new Date('2015-06-15')
      },
      {
        name: 'Liam Smith',
        classLevel: 'PreKG',
        dob: new Date('2021-05-22'),
        fatherName: 'James Smith',
        fatherPhone: '9876543212',
        fatherDob: new Date('1988-12-08'),
        motherName: 'Emily Smith',
        motherPhone: '9876543213',
        motherDob: new Date('1991-03-15'),
        parentsAnniversary: new Date('2014-09-22')
      },
      {
        name: 'Emma Wilson',
        classLevel: 'PreKG',
        dob: new Date('2021-07-10'),
        fatherName: 'Michael Wilson',
        fatherPhone: '9876543214',
        fatherDob: new Date('1989-01-25'),
        motherName: 'Jessica Wilson',
        motherPhone: '9876543215',
        motherDob: new Date('1990-07-12'),
        parentsAnniversary: new Date('2016-11-10')
      },
      {
        name: 'Noah Brown',
        classLevel: 'PreKG',
        dob: new Date('2021-09-18'),
        fatherName: 'David Brown',
        fatherPhone: '9876543216',
        fatherDob: new Date('1987-04-30'),
        motherName: 'Lisa Brown',
        motherPhone: '9876543217',
        motherDob: new Date('1989-09-14'),
        parentsAnniversary: new Date('2013-02-14')
      },
      // LKG
      {
        name: 'Sophia Davis',
        classLevel: 'LKG',
        dob: new Date('2020-02-14'),
        fatherName: 'Christopher Davis',
        fatherPhone: '9876543218',
        fatherDob: new Date('1986-06-18'),
        motherName: 'Amanda Davis',
        motherPhone: '9876543219',
        motherDob: new Date('1988-10-22'),
        parentsAnniversary: new Date('2012-05-20')
      },
      {
        name: 'Mason Garcia',
        classLevel: 'LKG',
        dob: new Date('2020-04-25'),
        fatherName: 'Jose Garcia',
        fatherPhone: '9876543220',
        fatherDob: new Date('1985-03-12'),
        motherName: 'Maria Garcia',
        motherPhone: '9876543221',
        motherDob: new Date('1987-08-09'),
        parentsAnniversary: new Date('2011-07-16')
      },
      {
        name: 'Olivia Rodriguez',
        classLevel: 'LKG',
        dob: new Date('2020-06-08'),
        fatherName: 'Carlos Rodriguez',
        fatherPhone: '9876543222',
        fatherDob: new Date('1984-09-05'),
        motherName: 'Patricia Rodriguez',
        motherPhone: '9876543223',
        motherDob: new Date('1986-12-11'),
        parentsAnniversary: new Date('2010-04-10')
      },
      {
        name: 'Ethan Martinez',
        classLevel: 'LKG',
        dob: new Date('2020-08-30'),
        fatherName: 'Diego Martinez',
        fatherPhone: '9876543224',
        fatherDob: new Date('1983-11-20'),
        motherName: 'Rosa Martinez',
        motherPhone: '9876543225',
        motherDob: new Date('1985-02-28'),
        parentsAnniversary: new Date('2009-08-25')
      },
      // UKG
      {
        name: 'Isabella Hernandez',
        classLevel: 'UKG',
        dob: new Date('2019-01-12'),
        fatherName: 'Antonio Hernandez',
        fatherPhone: '9876543226',
        fatherDob: new Date('1982-07-14'),
        motherName: 'Sofia Hernandez',
        motherPhone: '9876543227',
        motherDob: new Date('1984-05-19'),
        parentsAnniversary: new Date('2008-06-08')
      },
      {
        name: 'Lucas Lopez',
        classLevel: 'UKG',
        dob: new Date('2019-03-20'),
        fatherName: 'Fernando Lopez',
        fatherPhone: '9876543228',
        fatherDob: new Date('1981-10-02'),
        motherName: 'Carmen Lopez',
        motherPhone: '9876543229',
        motherDob: new Date('1983-01-16'),
        parentsAnniversary: new Date('2007-03-12')
      },
      {
        name: 'Mia Lee',
        classLevel: 'UKG',
        dob: new Date('2019-05-17'),
        fatherName: 'Wei Lee',
        fatherPhone: '9876543230',
        fatherDob: new Date('1980-08-24'),
        motherName: 'Lin Lee',
        motherPhone: '9876543231',
        motherDob: new Date('1982-04-07'),
        parentsAnniversary: new Date('2006-09-18')
      },
      {
        name: 'Benjamin Taylor',
        classLevel: 'UKG',
        dob: new Date('2019-07-09'),
        fatherName: 'William Taylor',
        fatherPhone: '9876543232',
        fatherDob: new Date('1979-12-15'),
        motherName: 'Nancy Taylor',
        motherPhone: '9876543233',
        motherDob: new Date('1981-06-21'),
        parentsAnniversary: new Date('2005-11-05')
      }
    ]

    // Sample events
    const events = [
      {
        title: 'Sports Day',
        date: new Date('2026-07-15'),
        description: 'Annual sports competition'
      },
      {
        title: 'Science Fair',
        date: new Date('2026-07-22'),
        description: 'Students showcase projects'
      },
      {
        title: 'Annual Day',
        date: new Date('2026-08-05'),
        description: 'Grand celebration and performances'
      },
      {
        title: 'Parent-Teacher Meeting',
        date: new Date('2026-07-10'),
        description: 'Meet parents for feedback'
      }
    ]

    await Student.insertMany(students)
    await Event.insertMany(events)

    console.log('Database seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seedDatabase()
