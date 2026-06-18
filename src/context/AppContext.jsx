import React, { createContext, useState, useContext, useEffect, useMemo } from 'react'
import { studentAPI, eventAPI } from '../utils/api'
import { getClassReminders } from '../utils/reminderUtils'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [currentUser] = useState({
    id: 1,
    name: 'Admin',
    role: 'Administrator'
  })

  const [students, setStudents] = useState({
    PreKG: [],
    LKG: [],
    UKG: []
  })

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [birthdays, setBirthdays] = useState([])

  // Helper function to calculate birthdays from students
  const calculateBirthdaysHelper = (allStudents) => {
    const celebrations = []

    Object.entries(allStudents).forEach(([classLevel, studentList]) => {
      if (studentList && studentList.length > 0) {
        // Only keep the next 3 days, using year-insensitive reminder logic.
        const reminders = getClassReminders(studentList, 3)
        
        reminders.forEach(reminder => {
          celebrations.push({
            id: `${reminder.name}-${reminder.type}`,
            name: reminder.name,
            date: reminder.date,
            class: classLevel,
            type: reminder.type.includes('birthday') ? 'birthday' : 'anniversary',
            daysUntil: reminder.daysUntil
          })
        })
      }
    })

    console.log('✅ [AppContext] Calculated birthdays:', celebrations.length, celebrations);
    setBirthdays(celebrations)
  }

  // Calculate birthdays and anniversaries from student data
  const calculateBirthdays = (allStudents) => {
    calculateBirthdaysHelper(allStudents)
  }

  useEffect(() => {
    fetchAllData()
  }, []) // ✅ EMPTY dependency array - runs only ONCE on mount

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [studentsRes, eventsRes] = await Promise.all([
        studentAPI.getAll(),
        eventAPI.getAll()
      ])

      if (studentsRes.success) {
        const grouped = {
          PreKG: studentsRes.data.filter(s => s.classLevel === 'PreKG'),
          LKG: studentsRes.data.filter(s => s.classLevel === 'LKG'),
          UKG: studentsRes.data.filter(s => s.classLevel === 'UKG')
        }
        setStudents(grouped)
        // Calculate birthdays after students are loaded
        calculateBirthdaysHelper(grouped)
      }

      if (eventsRes.success) {
        setEvents(eventsRes.data)
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addStudent = async (classLevel, studentData) => {
    try {
      const dataWithClass = { ...studentData, classLevel }
      const response = await studentAPI.create(dataWithClass)
      if (!response.success) {
        throw new Error(response.error || 'Failed to add student')
      }
      const updatedStudents = {
        ...students,
        [classLevel]: [...students[classLevel], response.data]
      }
      setStudents(updatedStudents)
      // Recalculate birthdays after adding student
      calculateBirthdaysHelper(updatedStudents)
      return response.data
    } catch (err) {
      console.error('Error adding student:', err)
      throw err
    }
  }

  const deleteStudent = async (classLevel, studentId) => {
    try {
      const response = await studentAPI.delete(studentId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete student')
      }
      const updatedStudents = {
        ...students,
        [classLevel]: students[classLevel].filter(s => s._id !== studentId)
      }
      setStudents(updatedStudents)
      // Recalculate birthdays after deleting student
      calculateBirthdaysHelper(updatedStudents)
    } catch (err) {
      console.error('Error deleting student:', err)
      throw err
    }
  }

  const addEvent = async (eventData) => {
    try {
      const response = await eventAPI.create(eventData)
      if (!response.success) {
        throw new Error(response.error || 'Failed to add event')
      }
      setEvents(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      console.error('Error adding event:', err)
      throw err
    }
  }

  const deleteEvent = async (eventId) => {
    try {
      const response = await eventAPI.delete(eventId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete event')
      }
      setEvents(prev => prev.filter(e => e._id !== eventId))
    } catch (err) {
      console.error('Error deleting event:', err)
      throw err
    }
  }

  const editEvent = async (eventId, eventData) => {
    try {
      const response = await eventAPI.update(eventId, eventData)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update event')
      }
      setEvents(prev => prev.map(e => e._id === eventId ? response.data : e))
      return response.data
    } catch (err) {
      console.error('Error editing event:', err)
      throw err
    }
  }

  // ✅ CRITICAL: Memoize the entire context value
  // This prevents recreating the object on every render, which was causing the infinite loop
  const value = useMemo(() => ({
    currentUser,
    students,
    events,
    birthdays,
    loading,
    error,
    addStudent,
    deleteStudent,
    addEvent,
    deleteEvent,
    editEvent,
    fetchAllData,
    setStudents,
    setEvents
  }), [currentUser, students, events, birthdays, loading, error])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}