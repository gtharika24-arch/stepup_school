const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
const fallbackApiHost = isLocalHost
  ? 'http://127.0.0.1:5000'
  : 'https://stepup-school-backend.onrender.com'
  
const BASE_API_URL = (import.meta.env.VITE_API_URL || fallbackApiHost).replace(/\/$/, '')
const API_URL = `${BASE_API_URL}/api`

// Helper function to check response status and parse JSON
const handleResponse = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }
  return data
}

// Students API
export const studentAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/students`)
    return handleResponse(response)
  },
  getByClass: async (classLevel) => {
    const response = await fetch(`${API_URL}/students/class/${classLevel}`)
    return handleResponse(response)
  },
  getById: async (id) => {
    const response = await fetch(`${API_URL}/students/${id}`)
    return handleResponse(response)
  },
  create: async (studentData) => {
    const dataToSend = {
      ...studentData,
      dob: studentData.dob ? studentData.dob.split('T')[0] : '',
      fatherDob: studentData.fatherDob ? studentData.fatherDob.split('T')[0] : null,
      motherDob: studentData.motherDob ? studentData.motherDob.split('T')[0] : null,
      parentsAnniversary: studentData.parentsAnniversary ? studentData.parentsAnniversary.split('T')[0] : null,
      rollNo: studentData.rollNo || ''
    }
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
    return handleResponse(response)
  },
  update: async (id, studentData) => {
    const dataToSend = {
      ...studentData,
      dob: studentData.dob ? studentData.dob.split('T')[0] : '',
      fatherDob: studentData.fatherDob ? studentData.fatherDob.split('T')[0] : null,
      motherDob: studentData.motherDob ? studentData.motherDob.split('T')[0] : null,
      parentsAnniversary: studentData.parentsAnniversary ? studentData.parentsAnniversary.split('T')[0] : null
    }
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
    return handleResponse(response)
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  }
}

// Events API
export const eventAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/events`)
    return handleResponse(response)
  },
  getById: async (id) => {
    const response = await fetch(`${API_URL}/events/${id}`)
    return handleResponse(response)
  },
  create: async (eventData) => {
    const dataToSend = {
      ...eventData,
      date: eventData.date || ''
    }
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
    return handleResponse(response)
  },
  update: async (id, eventData) => {
    const dataToSend = {
      ...eventData,
      date: eventData.date || ''
    }
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
    return handleResponse(response)
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  }
}

export const feeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/fees`)
    return handleResponse(response)
  },
  getById: async (id) => {
    const response = await fetch(`${API_URL}/fees/${id}`)
    return handleResponse(response)
  },
  create: async (feeData) => {
    const response = await fetch(`${API_URL}/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...feeData,
        date: feeData.date || '',
        amount: Number(feeData.amount) || 0
      })
    })
    return handleResponse(response)
  },
  update: async (id, feeData) => {
    const response = await fetch(`${API_URL}/fees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...feeData,
        date: feeData.date || '',
        amount: Number(feeData.amount) || 0
      })
    })
    return handleResponse(response)
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/fees/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  }
}