import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { getStudentReminders } from '../utils/reminderUtils'
import Sidebar from '../components/Sidebar'
import '../styles/Calendar.css'

export default function Calendar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManageEvents = ['admin', 'member', 'teacher'].includes(user?.role)
  const { events, addEvent, deleteEvent, editEvent, students } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5))
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({ title: '', date: '', description: '' })
  const [successMessage, setSuccessMessage] = useState('')
  const [eventReminders, setEventReminders] = useState([])
  const [birthdayReminders, setBirthdayReminders] = useState([])

  // Day modal state
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState([])
  const [showDayModal, setShowDayModal] = useState(false)
  const [dayFormData, setDayFormData] = useState({ title: '', description: '' })

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const formatDateToString = (dateObj) => {
    const date = new Date(dateObj)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventsReminders = []
    events.forEach(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      const daysUntil = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24))
      if (daysUntil >= 0 && daysUntil <= 3) {
        eventsReminders.push({
          type: 'event', title: event.title, date: eventDate, daysUntil,
          dateStr: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })
      }
    })
    setEventReminders(eventsReminders.sort((a, b) => a.daysUntil - b.daysUntil))

    const bdayReminders = []
    Object.values(students).forEach(classStudents => {
      if (Array.isArray(classStudents)) {
        classStudents.forEach(student => {
          const studentReminders = getStudentReminders(student, 3)
          bdayReminders.push(...studentReminders.map(reminder => ({
            ...reminder, studentName: student.name, className: student.classLevel || 'N/A'
          })))
        })
      }
    })
    setBirthdayReminders(bdayReminders.sort((a, b) => a.daysUntil - b.daysUntil))
  }, [students, events])

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => formatDateToString(event.date) === dateStr)
  }

  // Click any day to open day modal
  const handleDayClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvts = getEventsForDate(day)
    setSelectedDay(dateStr)
    setSelectedDayEvents(dayEvts)
    setDayFormData({ title: '', description: '' })
    setShowDayModal(true)
  }

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))

  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDayFormChange = (e) => {
    const { name, value } = e.target
    setDayFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteEvent = async (eventId) => {
    if (!canManageEvents) { alert('Only authorized users can delete calendar events.'); return }
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await deleteEvent(eventId)
      setSuccessMessage('✅ Event deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      alert(`Failed to delete event: ${error.message}`)
    }
  }

  const handleDayModalDelete = async (eventId) => {
    if (!canManageEvents) { alert('Only authorized users can delete calendar events.'); return }
    if (!window.confirm('Delete this event?')) return
    try {
      await deleteEvent(eventId)
      setSelectedDayEvents(prev => prev.filter(e => e._id !== eventId))
      setSuccessMessage('✅ Event deleted!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      alert(`Failed to delete event: ${error.message}`)
    }
  }

  const handleEditClick = (event) => {
    if (!canManageEvents) { alert('Only authorized users can edit calendar events.'); return }
    setEditingEvent(event)
    const eventDate = new Date(event.date)
    const dateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
    setFormData({ title: event.title, date: dateStr, description: event.description || '' })
    setShowEditEvent(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!canManageEvents) { alert('Only authorized users can update calendar events.'); return }
    if (!formData.title || !formData.date) { alert('Please fill in required fields'); return }
    try {
      const result = await editEvent(editingEvent._id, { ...formData })
      if (!result) throw new Error('Failed to update event - no response')
      setSuccessMessage('✅ Event updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
      setFormData({ title: '', date: '', description: '' })
      setShowEditEvent(false)
      setEditingEvent(null)
    } catch (error) {
      alert(`Failed to update event: ${error.message}`)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!canManageEvents) { alert('Only authorized users can add calendar events.'); return }
    if (!formData.title || !formData.date) { alert('Please fill in required fields'); return }
    try {
      const result = await addEvent({ ...formData })
      if (!result) throw new Error('Failed to add event - no response')
      setSuccessMessage('✅ Event added successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
      setFormData({ title: '', date: '', description: '' })
      setShowAddEvent(false)
    } catch (error) {
      alert(`Failed to add event: ${error.message}`)
    }
  }

  const handleDayModalAdd = async () => {
    if (!canManageEvents) { alert('Only authorized users can add calendar events.'); return }
    if (!dayFormData.title) { alert('Please enter a title'); return }
    try {
      const result = await addEvent({
        title: dayFormData.title,
        date: selectedDay,
        description: dayFormData.description
      })
      if (!result) throw new Error('Failed to add event')
      setSelectedDayEvents(prev => [...prev, result])
      setDayFormData({ title: '', description: '' })
      setSuccessMessage('✅ Event added!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      alert(`Failed to add event: ${error.message}`)
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const today = new Date()
  const isToday = (day) =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()

  const formatDayLabel = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <div className="cal-shell">
        <Sidebar />

        <div className="cal-main">
          <header className="cal-topbar">
            <div className="topbar-left">
              <div className="topbar-breadcrumb">
                <span className="bc-parent">School Manager</span>
                <span className="bc-sep">›</span>
                <span className="bc-current">Calendar</span>
              </div>
            </div>
          </header>

          <div className="cal-content">
            <div className="page-header">
              <div>
                <div className="page-eyebrow">Schedule Overview</div>
                <h1 className="page-title">📅 School Calendar & Events</h1>
                <p className="page-subtitle">Keep track of school dates and upcoming activities.</p>
              </div>
              <div className="header-actions">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
                {canManageEvents
                  ? <button className="add-event-btn" onClick={() => setShowAddEvent(true)}>+ Add Event</button>
                  : <span className="view-only-chip">View only</span>
                }
              </div>
            </div>

            {successMessage && <div className="success-banner">{successMessage}</div>}

            <div className="cal-body">
              <div className="calendar-card">
                <div className="calendar-nav-row">
                  <button className="month-nav-btn" onClick={handlePrevMonth}>← Prev</button>
                  <span className="month-label">{monthName}</span>
                  <button className="month-nav-btn" onClick={handleNextMonth}>Next →</button>
                </div>

                <div className="cal-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="weekday-hdr">{d}</div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    const dayEvents = day ? getEventsForDate(day) : []
                    return (
                      <div
                        key={idx}
                        className={`cal-day ${day ? 'active' : 'inactive'} ${day && isToday(day) ? 'today' : ''}`}
                        onClick={() => day && handleDayClick(day)}
                        style={day ? { cursor: 'pointer' } : {}}
                        title={day ? 'Click to view / add events' : ''}
                      >
                        {day && (
                          <>
                            <div className="day-num">{day}</div>
                            {dayEvents.map(ev => (
                              <div key={ev._id || ev.id} className="event-pill" title={ev.title}>
                                {ev.title.substring(0, 6)}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* UPCOMING EVENTS - ONLY NEXT 3 SHOWN */}
              <div className="events-card">
                <div className="events-card-title">📋 Upcoming Events</div>
                {events && events.filter(event => new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length > 0
                  ? [...events]
                    .filter(event => new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 3)
                    .map(event => (
                      <div key={event._id || event.id} className="event-item">
                        <div className="event-item-date">
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="event-item-title">{event.title}</div>
                        <div className="event-item-desc">{event.description || 'No description'}</div>
                        {canManageEvents && (
                          <div className="event-item-actions">
                            <button className="edit-btn" onClick={() => handleEditClick(event)}>✏️ Edit</button>
                            <button className="delete-btn" onClick={() => handleDeleteEvent(event._id)}>🗑️ Delete</button>
                          </div>
                        )}
                      </div>
                    ))
                  : <div className="no-events">🌟 No upcoming events</div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DAY MODAL */}
      {showDayModal && (
        <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>📅 {formatDayLabel(selectedDay).split(',')[0]}</h2>
                <div className="modal-date-badge">
                  🗓 {formatDayLabel(selectedDay).split(',').slice(1).join(',').trim()}
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowDayModal(false)}>×</button>
            </div>

            <div className="modal-form">
              <p className="day-modal-section-label">
                {selectedDayEvents.length > 0
                  ? `${selectedDayEvents.length} Event${selectedDayEvents.length > 1 ? 's' : ''}`
                  : 'No events scheduled'}
              </p>

              {selectedDayEvents.length > 0 && (
                <div className="day-events-list">
                  {selectedDayEvents.map(ev => (
                    <div key={ev._id} className="day-event-row">
                      <div className="day-event-info">
                        <p className="day-event-title">{ev.title}</p>
                        <p className="day-event-desc">{ev.description || 'No description'}</p>
                      </div>
                      {canManageEvents && (
                        <div className="day-event-actions">
                          <button className="edit-btn" onClick={() => {
                            setShowDayModal(false)
                            handleEditClick(ev)
                          }}>✏️ Edit</button>
                          <button className="delete-btn" onClick={() => handleDayModalDelete(ev._id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canManageEvents && (
                <>
                  {selectedDayEvents.length > 0 && <div className="modal-divider" />}
                  <p className="day-modal-section-label">Add New Event</p>
                  <div className="form-group">
                    <label>Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={dayFormData.title}
                      onChange={handleDayFormChange}
                      placeholder="e.g., School Picnic"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={dayFormData.description}
                      onChange={handleDayFormChange}
                      placeholder="Optional — add more context"
                      rows="2"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDayModal(false)}>Close</button>
              {canManageEvents && (
                <button className="submit-btn" onClick={handleDayModalAdd}>+ Add Event</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {showAddEvent && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-head">
              <h2>✨ Add New Event</h2>
              <button className="modal-close" onClick={() => setShowAddEvent(false)}>×</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., School Picnic" />
              </div>
              <div className="form-group">
                <label>Event Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter event description" rows="3" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddEvent(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddSubmit}>Add Event</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditEvent && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-head">
              <h2>✏️ Edit Event</h2>
              <button className="modal-close" onClick={() => setShowEditEvent(false)}>×</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., School Picnic" />
              </div>
              <div className="form-group">
                <label>Event Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter event description" rows="3" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowEditEvent(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleEditSubmit}>Update Event</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}