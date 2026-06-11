import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, events, birthdays } = useAppContext()

  const getUpcomingEvents = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 2)
  }

  const getUpcomingCelebrations = () => {
    return birthdays.filter(b => b.daysUntil === 0)
  }

  const upcomingEvents = getUpcomingEvents()
  const upcomingCelebrations = getUpcomingCelebrations()

  const classes = [
    { key: 'PreKG', icon: '🎓', label: 'PreKG', desc: 'Pre-Kindergarten',    cls: 'prekg', wrap: 'prekg-wrap' },
    { key: 'LKG',   icon: '📚', label: 'LKG',   desc: 'Lower Kindergarten',  cls: 'lkg',   wrap: 'lkg-wrap'   },
    { key: 'UKG',   icon: '✏️', label: 'UKG',   desc: 'Upper Kindergarten',  cls: 'ukg',   wrap: 'ukg-wrap'   },
  ]

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-top">
            <span className="header-icon">🏫</span>
            <h1>School Management System</h1>
          </div>
          <p className="welcome-text">👋 Welcome back</p>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="quick-actions">
          <button onClick={() => navigate('/calendar')} className="action-btn">
            📅 Calendar & Events
          </button>
        </div>

        <section className="classes-section">
          <h2 className="section-title">🏷️ Select Class</h2>
          <div className="classes-grid">
            {classes.map(({ key, icon, label, desc, cls, wrap }) => (
              <button
                key={key}
                onClick={() => navigate(`/students/${key}`)}
                className={`class-btn ${cls}`}
              >
                <div className={`class-icon-wrap ${wrap}`}>
                  <span>{icon}</span>
                </div>
                <span className="class-name">{label}</span>
                <span className="class-desc">{desc}</span>
                <span className="class-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <div className="reminders-grid">
          <section className="reminder-card">
            <div className="card-header">
              <div className="card-header-left">
                <span className="card-header-icon">📅</span>
                <h3>Event Reminders</h3>
              </div>
              <span className="card-count">{upcomingEvents.length}</span>
            </div>
            <div className="reminder-list">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id || event._id} className="reminder-item event-item">
                    <div className="reminder-date">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="reminder-content">
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-items">🌟 No upcoming events</p>
              )}
            </div>
          </section>

          <section className="reminder-card">
            <div className="card-header">
              <div className="card-header-left">
                <span className="card-header-icon">🎉</span>
                <h3>Birthday & Anniversaries</h3>
              </div>
              <span className="card-count">{upcomingCelebrations.length}</span>
            </div>
            <div className="reminder-list">
              {upcomingCelebrations.length > 0 ? (
                upcomingCelebrations.map(c => (
                  <div key={c.id} className={`celebration-item ${c.type}`}>
                    <div className="celebration-icon">
                      {c.type === 'birthday' ? '🎂' : '🎊'}
                    </div>
                    <div className="reminder-content">
                      <h4>{c.name}</h4>
                      <p>
                        <span className="celebration-type">
                          {c.type === 'birthday' ? 'Birthday' : 'Anniversary'}
                        </span>
                        <span className="celebration-class">{c.class}</span>
                      </p>
                      <span className="celebration-date">
                        {new Date(c.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-items">🌸 No upcoming celebrations</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}