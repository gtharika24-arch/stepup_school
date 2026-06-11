import React, { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [teachers, setTeachers] = useState([
    { id: 1, email: 'teacher1@school.com', password: '123456', name: 'John Smith' },
    { id: 2, email: 'teacher2@school.com', password: '123456', name: 'Sarah Johnson' },
    { id: 3, email: 'teacher3@school.com', password: '123456', name: 'Mike Davis' },
  ])

  const login = (email, password) => {
    const teacher = teachers.find(
      (t) => t.email === email && t.password === password
    )
    if (teacher) {
      setUser(teacher)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, teachers }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
