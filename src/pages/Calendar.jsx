import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import '../styles/Calendar.css'

export default function Calendar() {
  const navigate = useNavigate()
  const { events, addEvent, deleteEvent, editEvent } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5)) // June 2026
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({ title: '', date: '', description: '' })
  const [successMessage, setSuccessMessage] = useState('')

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  // Convert date to YYYY-MM-DD string for comparison
  const formatDateToString = (dateObj) => {
    const date = new Date(dateObj)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getEventsForDate = (day) => {
    // Create date string for the calendar day
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const matchedEvents = events.filter(event => {
      // Convert MongoDB date to YYYY-MM-DD format for comparison
      const eventDateStr = formatDateToString(event.date)
      return eventDateStr === dateStr
    })
    
    console.log(`Events for ${dateStr}:`, matchedEvents)
    return matchedEvents
  }

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))

  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    
    try {
      await deleteEvent(eventId)
      setSuccessMessage('✅ Event deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting event:', error)
      alert(`Failed to delete event: ${error.message}`)
    }
  }

  const handleEditClick = (event) => {
    setEditingEvent(event)
    // Convert date to YYYY-MM-DD format for input
    const eventDate = new Date(event.date)
    const dateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
    setFormData({
      title: event.title,
      date: dateStr,
      description: event.description || ''
    })
    setShowEditEvent(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date) {
      alert('Please fill in required fields')
      return
    }

    try {
      console.log('Updating event:', editingEvent._id, formData)
      
      const eventDataToSubmit = {
        ...formData,
        date: formData.date
      }
      
      const result = await editEvent(editingEvent._id, eventDataToSubmit)
      
      if (!result) {
        throw new Error('Failed to update event - no response')
      }
      
      console.log('✅ Event updated successfully:', result)
      
      setSuccessMessage('✅ Event updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setFormData({ title: '', date: '', description: '' })
      setShowEditEvent(false)
      setEditingEvent(null)
      
    } catch (error) {
      console.error('❌ Error updating event:', error.message)
      alert(`Failed to update event: ${error.message}`)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date) {
      alert('Please fill in required fields')
      return
    }

    try {
      console.log('Adding event:', formData)
      
      const eventDataToSubmit = {
        ...formData,
        date: formData.date // Date input returns YYYY-MM-DD string
      }
      
      const result = await addEvent(eventDataToSubmit)
      
      if (!result) {
        throw new Error('Failed to add event - no response')
      }
      
      console.log('✅ Event added successfully:', result)
      
      setSuccessMessage('✅ Event added successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setFormData({ title: '', date: '', description: '' })
      setShowAddEvent(false)
      
    } catch (error) {
      console.error('❌ Error adding event:', error.message)
      alert(`Failed to add event: ${error.message}`)
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  console.log('Current events in state:', events)

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>🗓️ School Calendar & Events</h1>
        <button onClick={() => setShowAddEvent(true)} className="add-event-btn">
          + Add Event
        </button>
      </header>

      {successMessage && (
        <div className="success-banner">{successMessage}</div>
      )}

      <main className="calendar-main">
        <div className="calendar-wrapper">
          {/* Navigation */}
          <div className="calendar-nav">
            <button onClick={handlePrevMonth} className="nav-btn">← Prev</button>
            <h2>{monthName}</h2>
            <button onClick={handleNextMonth} className="nav-btn">Next →</button>
          </div>

          {/* Grid */}
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
            {calendarDays.map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : []
              return (
                <div key={index} className={`calendar-day ${day ? 'active' : 'inactive'}`}>
                  {day && (
                    <>
                      <div className="day-number">{day}</div>
                      <div className="day-events">
                        {dayEvents.length > 0 ? (
                          dayEvents.map(event => (
                            <div 
                              key={event._id || event.id} 
                              className="event-dot" 
                              title={event.title}
                            >
                              {event.title.substring(0, 4)}
                            </div>
                          ))
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="events-section">
          <h2>📋 Upcoming Events</h2>
          <div className="events-list">
            {events && events.length > 0 ? (
              [...events]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(event => (
                  <div key={event._id || event.id} className="event-card">
                    <div className="event-date">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <div className="event-content">
                      <h3>{event.title}</h3>
                      <p>{event.description || 'No description'}</p>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditClick(event)}
                        title="Edit event"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteEvent(event._id)}
                        title="Delete event"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p className="no-events">🌟 No events scheduled</p>
            )}
          </div>
        </div>
      </main>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>✨ Add New Event</h2>
              <button className="close-btn" onClick={() => setShowAddEvent(false)}>×</button>
            </div>
            <form onSubmit={handleAddSubmit} className="add-event-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title}
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g., School Picnic" 
                />
              </div>
              <div className="form-group">
                <label>Event Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date}
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange} 
                  placeholder="Enter event description" 
                  rows="3" 
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddEvent(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ Edit Event</h2>
              <button className="close-btn" onClick={() => setShowEditEvent(false)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="add-event-form">
              <div className="form-group">
                <label>Event Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title}
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g., School Picnic" 
                />
              </div>
              <div className="form-group">
                <label>Event Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date}
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange} 
                  placeholder="Enter event description" 
                  rows="3" 
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditEvent(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Update Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}