import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'  // ✅ Add this
import { getStudentReminders } from '../utils/reminderUtils'
import Sidebar from '../components/Sidebar'
import '../styles/Dashboard.css'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { students, events } = useAppContext()
  const { user: currentUser } = useAuth()  // ✅ Use this instead
  const [eventReminders, setEventReminders] = useState([])
  const [birthdayReminders, setBirthdayReminders] = useState([])

  const getUpcomingEvents = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
  }

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 1️⃣ Event Reminders
    const eventsReminders = []
    events.forEach(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      const daysUntil = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24))
      
      if (daysUntil >= 0 && daysUntil <= 3) {
        eventsReminders.push({
          type: 'event',
          title: event.title,
          date: eventDate,
          daysUntil,
          dateStr: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          color: '#db3425'
        })
      }
    })
    setEventReminders(eventsReminders.sort((a, b) => a.daysUntil - b.daysUntil))

    // 2️⃣ Birthday & Anniversary Reminders
    const bdayReminders = []
    Object.values(students).forEach(classStudents => {
      if (Array.isArray(classStudents)) {
        classStudents.forEach(student => {
          const studentReminders = getStudentReminders(student, 3)
          bdayReminders.push(...studentReminders.map(reminder => ({
            ...reminder,
            studentName: student.name,
            className: student.classLevel || 'N/A'
          })))
        })
      }
    })
    setBirthdayReminders(bdayReminders.sort((a, b) => a.daysUntil - b.daysUntil))
  }, [students, events])

  const upcomingEvents = getUpcomingEvents()
  
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const classes = [
    { key: 'PreKG', icon: '🎓', label: 'PreKG', desc: 'Pre-Kindergarten' },
    { key: 'LKG', icon: '📚', label: 'LKG', desc: 'Lower Kindergarten' },
    { key: 'UKG', icon: '✏️', label: 'UKG', desc: 'Upper Kindergarten' },
  ]

  // Calculate total students
  const totalStudents = Object.values(students).reduce((sum, classStudents) => {
    return sum + (Array.isArray(classStudents) ? classStudents.length : 0)
  }, 0)

  // ✅ Check if user is admin
  const isAdmin = currentUser?.role === 'admin'
  const userRole = isAdmin ? 'Admin' : 'Teacher'

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="header-subtitle">Welcome back! </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          {/* Greeting Card */}
          <section className="greeting-card">
            <div className="greeting-content">
              <div>
                {/* ✅ Show role in greeting */}
                <h2 className="greeting-title">Good Morning, {currentUser?.name || 'User'}!</h2>
                <p className="greeting-date">{todayLabel} · <span className="user-role-badge">{userRole}</span></p>
              </div>
              <button onClick={() => navigate('/calendar')} className="cta-button">
                📅 Calendar & Events
              </button>
            </div>
          </section>

          {/* 🎉 TWO COLUMN REMINDERS SECTION */}
          <div className="reminders-container">
            {/* Left: Event Reminders */}
            <section className="reminders-card event-reminders-card">
              <div className="reminders-card-header">
                <div className="reminders-card-title">
                  <span className="reminders-icon">📅</span>
                  <h3>Event Reminders</h3>
                </div>
                <div className="reminders-badge">{eventReminders.length}</div>
              </div>
              
              <div className="reminders-list">
                {eventReminders.length > 0 ? (
                  eventReminders.map((reminder, idx) => (
                    <div key={idx} className="reminder-item event-reminder-item">
                      <div className="reminder-date-badge">
                        {reminder.dateStr}
                      </div>
                      <div className="reminder-details">
                        <p className="reminder-title">{reminder.title}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-reminder">No upcoming events</div>
                )}
              </div>
            </section>

            {/* Right: Birthday & Anniversaries */}
            <section className="reminders-card birthday-reminders-card">
              <div className="reminders-card-header">
                <div className="reminders-card-title">
                  <span className="reminders-icon">🎂</span>
                  <h3>Birthday & Anniversaries</h3>
                </div>
                <div className="reminders-badge">{birthdayReminders.length}</div>
              </div>
              
              <div className="reminders-list">
                {birthdayReminders.length > 0 ? (
                  birthdayReminders.map((reminder, idx) => (
                    <div key={idx} className="reminder-item birthday-reminder-item">
                      <div className="reminder-icon-wrapper">
                        {reminder.emoji}
                      </div>
                      <div className="reminder-details">
                        <p className="reminder-title">{reminder.studentName}</p>
                        <p className="reminder-type">{reminder.message.replace(reminder.studentName, '').trim()}</p>
                        <p className="reminder-class">{reminder.className}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-reminder">No upcoming birthdays</div>
                )}
              </div>
            </section>
          </div>


          {/* Classes Section */}
          <section className="classes-section">
            <div className="section-header">
              <div className="accent-bar"></div>
              <h3>Classes</h3>
            </div>

            <div className="classes-grid">
              {classes.map(({ key, icon, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(`/students/${key}`)}
                  className="class-card"
                >
                  <div className="card-top">
                    <div className="class-icon">{icon}</div>
                    <span className="class-badge">→</span>
                  </div>
                  <h4 className="class-name">{label}</h4>
                  <p className="class-desc">{desc}</p>
                </button>
              ))}

              {/* ✅ Only show Fee Structure to admins */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/fees')}
                  className="class-card fee-card"
                >
                  <div className="card-top">
                    <div className="class-icon">💳</div>
                    <span className="class-badge">→</span>
                  </div>
                  <h4 className="class-name">FEE DETAILS</h4>
                  <p className="class-desc">View and manage fee records by class.</p>
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}