import React, { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('school-user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch (error) {
      console.error('Failed to load saved user:', error)
      return null
    }
  })

  const [teachers] = useState([
    { id: 1, email: 'admin@school.com', password: 'stepup', name: 'Admin User', role: 'admin' },
    { id: 2, email: 'member@school.com', password: 'member123', name: 'Teacher', role: 'member' },
  ])

  const login = (email, password) => {
    const teacher = teachers.find(
      (t) => t.email === email && t.password === password
    )

    if (teacher) {
      const userToStore = { ...teacher }
      setUser(userToStore)
      localStorage.setItem('school-user', JSON.stringify(userToStore))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('school-user')
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
