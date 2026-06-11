import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { studentAPI } from '../utils/api'
import { getStudentReminders } from '../utils/reminderUtils'
import '../styles/StudentList.css'

export default function StudentList() {
  const { classLevel } = useParams()
  const navigate = useNavigate()
  const { students, addStudent, deleteStudent, setStudents, loading } = useAppContext()
  const classList = students[classLevel] || []

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('none')
  const [showReminders, setShowReminders] = useState(true)
  const [reminders, setReminders] = useState([])

  const emptyForm = {
    name: '',
    dob: '',
    fatherName: '',
    fatherPhone: '',
    fatherDob: '',
    motherName: '',
    motherPhone: '',
    motherDob: '',
    parentsAnniversary: ''
  }

  const [formData, setFormData] = useState(emptyForm)

  // 📅 Update reminders when students change
  useEffect(() => {
    const allReminders = [];
    classList.forEach(student => {
      const studentReminders = getStudentReminders(student, 3); // Next 3 days
      allReminders.push(...studentReminders);
    });
    // Sort by days until
    setReminders(allReminders.sort((a, b) => a.daysUntil - b.daysUntil));
  }, [classList])

  // 🔍 Filter
  const filtered = classList.filter(student => {
    const q = searchQuery.toLowerCase()
    return (
      student.name?.toLowerCase().includes(q) ||
      student.fatherName?.toLowerCase().includes(q) ||
      student.motherName?.toLowerCase().includes(q) ||
      student.fatherPhone?.includes(q) ||
      student.motherPhone?.includes(q)
    )
  })

  // 🔃 Sort
  const filteredList = [...filtered].sort((a, b) => {
    if (sortBy === 'name-az')   return a.name?.localeCompare(b.name)
    if (sortBy === 'name-za')   return b.name?.localeCompare(a.name)
    if (sortBy === 'dob-asc')   return new Date(a.dob) - new Date(b.dob)
    if (sortBy === 'dob-desc')  return new Date(b.dob) - new Date(a.dob)
    return 0
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return

    try {
      if (editingStudent) {
        const studentId = editingStudent._id || editingStudent.id
        const response = await studentAPI.update(studentId, {
          ...editingStudent,
          ...formData,
          classLevel,
          dob: formData.dob ? formData.dob.split('T')[0] : '',
          fatherDob: formData.fatherDob ? formData.fatherDob.split('T')[0] : null,
          motherDob: formData.motherDob ? formData.motherDob.split('T')[0] : null,
          parentsAnniversary: formData.parentsAnniversary ? formData.parentsAnniversary.split('T')[0] : null
        })

        if (!response.success) {
          throw new Error(response.error || 'Failed to update student')
        }

        setStudents(prev => ({
          ...prev,
          [classLevel]: prev[classLevel].map(s =>
            (s._id || s.id) === studentId ? response.data : s
          )
        }))
        setEditingStudent(null)
      } else {
        await addStudent(classLevel, formData)
      }

      setFormData(emptyForm)
      setShowAddForm(false)
    } catch (error) {
      console.error('Error saving student:', error)
      alert(`Failed to save student: ${error.message}`)
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name || '',
      dob: student.dob ? student.dob.slice(0, 10) : '',
      fatherName: student.fatherName || '',
      fatherPhone: student.fatherPhone || '',
      fatherDob: student.fatherDob ? student.fatherDob.slice(0, 10) : '',
      motherName: student.motherName || '',
      motherPhone: student.motherPhone || '',
      motherDob: student.motherDob ? student.motherDob.slice(0, 10) : '',
      parentsAnniversary: student.parentsAnniversary ? student.parentsAnniversary.slice(0, 10) : ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        if (deleteStudent) {
          await deleteStudent(classLevel, student._id || student.id)
        } else {
          setStudents(prev => ({
            ...prev,
            [classLevel]: prev[classLevel].filter(
              s => (s._id || s.id) !== (student._id || student.id)
            )
          }))
        }
      } catch (error) {
        console.error('Error deleting student:', error)
        alert(`Failed to delete student: ${error.message}`)
      }
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return isNaN(d) ? '-' : d.toLocaleDateString()
  }

  const sortOptions = [
    { value: 'none',      label: '— Sort By —' },
    { value: 'name-az',   label: '🔤 Name: A → Z' },
    { value: 'name-za',   label: '🔤 Name: Z → A' },
    { value: 'dob-asc',   label: '📅 DOB: Oldest First' },
    { value: 'dob-desc',  label: '📅 DOB: Youngest First' },
  ]

  const headerColors = {
    PreKG: 'linear-gradient(135deg, #ffe0ec 0%, #ffd6a5 50%, #c9b8f5 100%)',
    LKG:   'linear-gradient(135deg, #c9f2e5 0%, #a8d8ea 50%, #c9b8f5 100%)',
    UKG:   'linear-gradient(135deg, #e4d9ff 0%, #fbc2eb 50%, #ffd6a5 100%)',
  }

  return (
    <div className="student-list-container">
      <header
        className="student-header"
        style={{ background: headerColors[classLevel] || headerColors.PreKG }}
      >
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back
        </button>
        <h1>
          {classLevel === 'PreKG' ? '🎓' : classLevel === 'LKG' ? '📚' : '✏️'} {classLevel} — Student List
        </h1>
        <button
          onClick={() => { setEditingStudent(null); setFormData(emptyForm); setShowAddForm(true) }}
          className="add-student-btn"
        >
          + Add Student
        </button>
      </header>

      <main className="student-main">
        {/* 🎉 Reminders Section */}
        {showReminders && reminders.length > 0 && (
          <div className="reminders-section">
            <div className="reminders-header">
              <h3>🎉 Upcoming Reminders (Next 3 Days)</h3>
              <button 
                className="close-reminders" 
                onClick={() => setShowReminders(false)}
              >
                ✕
              </button>
            </div>
            <div className="reminders-grid">
              {reminders.slice(0, 5).map((reminder, idx) => (
                <div 
                  key={idx} 
                  className="reminder-card"
                  style={{ borderLeftColor: reminder.color }}
                >
                  <div className="reminder-emoji">{reminder.emoji}</div>
                  <div className="reminder-content">
                    <p className="reminder-message">{reminder.message}</p>
                  </div>
                  <div className="reminder-days">
                    {reminder.daysUntil === 0 ? '🎯 TODAY' : reminder.daysUntil === 1 ? '📅 TMRW' : `${reminder.daysUntil}d`}
                  </div>
                </div>
              ))}
              {reminders.length > 5 && (
                <div className="reminder-more">
                  +{reminders.length - 5} more reminders
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="student-toolbar">
          <p className="total-students">
            Total Students: <strong>{classList.length}</strong>
            {searchQuery && filteredList.length !== classList.length && (
              <span className="search-count"> (showing {filteredList.length})</span>
            )}
          </p>

          <div className="toolbar-right">
            {/* Search */}
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search name, father, mother, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {/* Sort */}
            <div className="sort-box">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {sortBy !== 'none' && (
                <button className="clear-sort" onClick={() => setSortBy('none')}>✕</button>
              )}
            </div>
          </div>
        </div>

        {loading && <div className="loading">🌸 Loading students...</div>}

        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th
                  className={`sortable-th ${sortBy.startsWith('name') ? 'active-sort' : ''}`}
                  onClick={() => setSortBy(prev => prev === 'name-az' ? 'name-za' : 'name-az')}
                >
                  Student Name
                  <span className="sort-arrow">
                    {sortBy === 'name-az' ? ' ▲' : sortBy === 'name-za' ? ' ▼' : ' ⇅'}
                  </span>
                </th>
                <th
                  className={`sortable-th ${sortBy.startsWith('dob') ? 'active-sort' : ''}`}
                  onClick={() => setSortBy(prev => prev === 'dob-asc' ? 'dob-desc' : 'dob-asc')}
                >
                  DOB
                  <span className="sort-arrow">
                    {sortBy === 'dob-asc' ? ' ▲' : sortBy === 'dob-desc' ? ' ▼' : ' ⇅'}
                  </span>
                </th>
                <th>Father Name</th>
                <th>Father Phone</th>
                <th>Father DOB</th>
                <th>Mother Name</th>
                <th>Mother Phone</th>
                <th>Mother DOB</th>
                <th>Parents Anniversary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((student) => (
                  <tr key={student._id || student.id}>
                    <td className="student-name">{student.name}</td>
                    <td>{formatDate(student.dob)}</td>
                    <td>{student.fatherName}</td>
                    <td>{student.fatherPhone}</td>
                    <td>{formatDate(student.fatherDob)}</td>
                    <td>{student.motherName}</td>
                    <td>{student.motherPhone}</td>
                    <td>{formatDate(student.motherDob)}</td>
                    <td>{formatDate(student.parentsAnniversary)}</td>
                    <td className="action-btns">
                      <button className="edit-btn" onClick={() => handleEdit(student)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(student)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-students">
                    {searchQuery
                      ? `🔍 No students found matching "${searchQuery}"`
                      : '🌸 No students found in this class'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingStudent ? `✏️ Edit — ${editingStudent.name}` : `✨ Add New Student to ${classLevel}`}
              </h2>
              <button className="close-btn" onClick={() => { setShowAddForm(false); setEditingStudent(null) }}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="add-student-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter student name"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-divider">👨 Father's Information</div>

                <div className="form-group">
                  <label>Father's Name</label>
                  <input type="text" name="fatherName" value={formData.fatherName}
                    onChange={handleInputChange} placeholder="Enter father's name" />
                </div>
                <div className="form-group">
                  <label>Father's Phone</label>
                  <input type="tel" name="fatherPhone" value={formData.fatherPhone}
                    onChange={handleInputChange} placeholder="Enter father's phone" />
                </div>
                <div className="form-group">
                  <label>Father's DOB</label>
                  <input type="date" name="fatherDob" value={formData.fatherDob}
                    onChange={handleInputChange} />
                </div>

                <div className="form-divider">👩 Mother's Information</div>

                <div className="form-group">
                  <label>Mother's Name</label>
                  <input type="text" name="motherName" value={formData.motherName}
                    onChange={handleInputChange} placeholder="Enter mother's name" />
                </div>
                <div className="form-group">
                  <label>Mother's Phone</label>
                  <input type="tel" name="motherPhone" value={formData.motherPhone}
                    onChange={handleInputChange} placeholder="Enter mother's phone" />
                </div>
                <div className="form-group">
                  <label>Mother's DOB</label>
                  <input type="date" name="motherDob" value={formData.motherDob}
                    onChange={handleInputChange} />
                </div>

                <div className="form-divider">💑 Parents Information</div>

                <div className="form-group full-width">
                  <label>Parents' Anniversary Date</label>
                  <input type="date" name="parentsAnniversary" value={formData.parentsAnniversary}
                    onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button"
                  onClick={() => { setShowAddForm(false); setEditingStudent(null) }}
                  className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingStudent ? '✅ Update Student' : '✨ Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}