import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import StudentList from './pages/StudentList'
import Calendar from './pages/Calendar'
import './App.css'

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students/:classLevel" element={<StudentList />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </Router>
  )
}

export default App
