import React, { useState, useEffect } from 'react'
import { saveLocal, getLocal, syncToServer } from '../db'
import './Calendar.css'

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: ''
  })

  useEffect(() => {
    loadEvents()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleOnline = () => {
    setIsOnline(true)
    console.log('✅ Syncing events...')
    loadEvents()
  }

  const handleOffline = () => {
    setIsOnline(false)
  }

  const loadEvents = async () => {
    try {
      // Try to fetch from server
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setEvents(data)
      
      // Save to local DB
      await saveLocal('events', data)
    } catch (error) {
      console.log('⚠️ Offline - loading from local storage')
      
      // Load from local DB
      const localEvents = await getLocal('events')
      setEvents(localEvents)
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    
    try {
      const newEvent = {
        _id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      }

      // Save locally immediately
      setEvents([...events, newEvent])
      await saveLocal('events', newEvent)

      // Try to sync to server
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const savedEvent = await response.json()
          setEvents(prev =>
            prev.map(e => e._id === newEvent._id ? savedEvent : e)
          )
          await saveLocal('events', savedEvent)
        }
      } catch (error) {
        console.log('⚠️ Event will sync when online')
      }

      // Reset form
      setFormData({ title: '', date: '', description: '' })
      setShowModal(false)
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  const handleEditEvent = async (e) => {
    e.preventDefault()
    
    try {
      const updatedEvent = {
        ...editingEvent,
        ...formData
      }

      // Update locally immediately
      setEvents(prev =>
        prev.map(e => e._id === editingEvent._id ? updatedEvent : e)
      )
      await saveLocal('events', updatedEvent)

      // Try to sync to server
      try {
        await fetch(`/api/events/${editingEvent._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } catch (error) {
        console.log('⚠️ Update will sync when online')
      }

      setFormData({ title: '', date: '', description: '' })
      setEditingEvent(null)
      setShowModal(false)
    } catch (error) {
      console.error('Error editing event:', error)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Delete this event?')) return

    try {
      // Delete locally immediately
      setEvents(prev => prev.filter(e => e._id !== eventId))
      await saveLocal('events', events.filter(e => e._id !== eventId))

      // Try to sync deletion to server
      try {
        await fetch(`/api/events/${eventId}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.log('⚠️ Deletion will sync when online')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="empty-day"></div>)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day)
      days.push(
        <div key={day} className="calendar-day">
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.map(event => (
              <div key={event._id} className="event-item">
                <span className="event-title">{event.title}</span>
                <div className="event-actions">
                  <button
                    className="event-btn edit"
                    onClick={() => {
                      setEditingEvent(event)
                      setFormData({
                        title: event.title,
                        date: event.date,
                        description: event.description || ''
                      })
                      setShowModal(true)
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="event-btn delete"
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>📅 Calendar</h1>
        <span className={`status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>

      <div className="calendar-controls">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="nav-btn"
        >
          ← Previous
        </button>
        <h2>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="nav-btn"
        >
          Next →
        </button>
      </div>

      <button
        onClick={() => {
          setEditingEvent(null)
          setFormData({ title: '', date: '', description: '' })
          setShowModal(true)
        }}
        className="add-event-btn"
      >
        + Add Event
      </button>

      <div className="calendar-grid">
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
        {renderCalendar()}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={editingEvent ? handleEditEvent : handleAddEvent}>
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}