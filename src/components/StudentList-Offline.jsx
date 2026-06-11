import React, { useState, useEffect } from 'react'
import { saveLocal, getLocal, syncToServer } from '../db'
import './StudentList.css'

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [selectedClass, setSelectedClass] = useState('')
  const [classes, setClasses] = useState([])

  useEffect(() => {
    loadStudents()
    loadClasses()

    // Listen for online/offline
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleOnline = () => {
    setIsOnline(true)
    console.log('✅ Back online - syncing...')
    loadStudents() // Refresh from server
  }

  const handleOffline = () => {
    setIsOnline(false)
    console.log('🔴 Offline mode')
  }

  const loadStudents = async () => {
    setLoading(true)
    try {
      // Try to fetch from server
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setStudents(data)
      
      // Save to local DB for offline use
      await saveLocal('students', data)
    } catch (error) {
      console.log('⚠️ Offline - loading from local storage')
      
      // Load from local DB
      const localStudents = await getLocal('students')
      setStudents(localStudents)
    } finally {
      setLoading(false)
    }
  }

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      const data = await response.json()
      setClasses(data)
    } catch (error) {
      // Extract classes from local students
      const localStudents = await getLocal('students')
      const uniqueClasses = [...new Set(localStudents.map(s => s.classLevel))]
      setClasses(uniqueClasses)
    }
  }

  const addStudent = async (studentData) => {
    try {
      const newStudent = {
        ...studentData,
        _id: Date.now().toString()
      }

      // Save locally immediately
      setStudents([...students, newStudent])
      await saveLocal('students', newStudent)

      // Try to sync to server
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      })

      if (response.ok) {
        const savedStudent = await response.json()
        // Update with server ID
        setStudents(prev =>
          prev.map(s => s._id === newStudent._id ? savedStudent : s)
        )
        await saveLocal('students', savedStudent)
      }
    } catch (error) {
      console.log('⚠️ Will sync when online')
    }
  }

  const deleteStudent = async (studentId) => {
    try {
      // Remove locally immediately
      setStudents(prev => prev.filter(s => s._id !== studentId))
      await saveLocal('students', students.filter(s => s._id !== studentId))

      // Try to sync deletion to server
      await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.log('⚠️ Deletion will sync when online')
    }
  }

  const filteredStudents = selectedClass
    ? students.filter(s => s.classLevel === selectedClass)
    : students

  if (loading) {
    return (
      <div className="student-list">
        <p>📂 Loading students...</p>
      </div>
    )
  }

  return (
    <div className="student-list">
      <div className="header">
        <h1>👥 Students</h1>
        <span className={`status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      <div className="filters">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="class-select"
        >
          <option value="">All Classes</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
        <button onClick={() => addStudent({
          name: 'New Student',
          classLevel: selectedClass || 'PreKG'
        })} className="add-btn">
          + Add Student
        </button>
      </div>

      <div className="students-container">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <div key={student._id} className="student-card">
              <div className="student-info">
                <h3>{student.name}</h3>
                <p>Class: {student.classLevel}</p>
                <p>DOB: {new Date(student.dob).toLocaleDateString()}</p>
                {student.fatherName && <p>Father: {student.fatherName}</p>}
              </div>
              <div className="student-actions">
                <button className="edit-btn">✏️ Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => deleteStudent(student._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty">No students found</p>
        )}
      </div>

      <div className="student-count">
        Total: {filteredStudents.length} students
      </div>
    </div>
  )
}