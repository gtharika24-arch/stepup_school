import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import StudentList from './pages/StudentList'
import Calendar from './pages/Calendar'
import FeeStructure from './pages/FeeStructure'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
            <Route path="/students/:classLevel" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/fees" element={<ProtectedRoute><FeeStructure /></ProtectedRoute>} />
            <Route path="/fee-structure" element={<ProtectedRoute><FeeStructure /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
