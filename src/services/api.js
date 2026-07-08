/**

 * Frontend API Service

 * Axios-based HTTP client for communicating with the backend Express API

 * 

 * Base URL: http://localhost:5000/api

 */



import axios from 'axios'



const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'



const api = axios.create({

  baseURL: API_BASE_URL,

  headers: {

    'Content-Type': 'application/json'

  },

  timeout: 10000

})



// ─── Response interceptor for error handling ───────────────────

api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response) {

      console.error(`API Error [${error.response.status}]:`, error.response.data)

    } else if (error.request) {

      console.error('API Error: No response received. Is the backend server running?')

    } else {

      console.error('API Error:', error.message)

    }

    return Promise.reject(error)

  }

)



// ================================================================

// USERS API

// ================================================================

export const usersAPI = {

  getAll: () => api.get('/users'),

  getById: (id) => api.get(`/users/${id}`),

  register: (data) => api.post('/users/register', data),

  addUser: (data) => api.post('/users/add-user', data),

  login: (data) => api.post('/users/login', data),

  updateStatus: (id, status) => api.put(`/users/${id}/status`, { status }),

  update: (id, data) => api.put(`/users/${id}`, data)

}



// ================================================================

// STAFF AUTH API (deprecated - use usersAPI instead)

// ================================================================

// export const staffAuthAPI = {

//   login: (data) => api.post('/staff-auth/login', data),

//   getProfile: (staffId) => api.get(`/staff-auth/profile/${staffId}`),

//   changePassword: (staffId, data) => api.put(`/staff-auth/change-password/${staffId}`, data)

// }



// ================================================================

// STUDENTS API

// ================================================================

export const studentsAPI = {

  getAll: () => api.get('/students'),

  getById: (id) => api.get(`/students/${id}`),

  create: (data) => api.post('/students', data),

  update: (id, data) => api.put(`/students/${id}`, data),

  delete: (id) => api.delete(`/students/${id}`)

}



// ================================================================

// INSTRUCTORS API

// ================================================================

export const instructorsAPI = {

  getAll: () => api.get('/instructors'),

  getById: (id) => api.get(`/instructors/${id}`),

  create: (data) => api.post('/instructors', data),

  update: (id, data) => api.put(`/instructors/${id}`, data),

  delete: (id) => api.delete(`/instructors/${id}`)

}



// ================================================================

// COURSES & PACKAGES API

// ================================================================

export const coursesAPI = {

  getAll: () => api.get('/courses'),

  getById: (id) => api.get(`/courses/${id}`),

  create: (data) => api.post('/courses', data),

  update: (id, data) => api.put(`/courses/${id}`, data),

  delete: (id) => api.delete(`/courses/${id}`),

  // Packages

  getPackages: () => api.get('/courses/packages/all'),

  createPackage: (data) => api.post('/courses/packages', data)

}



// ================================================================

// ENROLLMENTS API

// ================================================================

export const enrollmentsAPI = {

  getAll: () => api.get('/enrollments'),

  getById: (id) => api.get(`/enrollments/${id}`),

  getByStudent: (studentId) => api.get(`/enrollments/student/${studentId}`),

  create: (data) => api.post('/enrollments', data),

  update: (id, data) => api.put(`/enrollments/${id}`, data),

  delete: (id) => api.delete(`/enrollments/${id}`)

}



// ================================================================

// LESSONS & ATTENDANCE API

// ================================================================

export const lessonsAPI = {

  getAll: () => api.get('/lessons'),

  getByInstructor: (instructorId) => api.get(`/lessons/instructor/${instructorId}`),

  getByStudent: (studentId) => api.get(`/lessons/student/${studentId}`),

  create: (data) => api.post('/lessons', data),

  updateStatus: (id, status) => api.put(`/lessons/${id}/status`, { status }),

  delete: (id) => api.delete(`/lessons/${id}`),

  // Attendance

  getAttendance: () => api.get('/lessons/attendance/all'),

  markAttendance: (data) => api.post('/lessons/attendance', data)

}



// ================================================================

// BILLING API

// ================================================================

export const billingAPI = {

  getCharges: () => api.get('/billing/charges'),

  createCharge: (data) => api.post('/billing/charges', data),

  getInvoices: () => api.get('/billing/invoices'),

  createInvoice: (data) => api.post('/billing/invoices', data),

  getPayments: () => api.get('/billing/payments'),

  recordPayment: (data) => api.post('/billing/payments', data)

}



// ================================================================

// STUDIOS & BOOKINGS API

// ================================================================

export const studiosAPI = {

  getAll: () => api.get('/studios'),

  create: (data) => api.post('/studios', data),

  getBookings: () => api.get('/studios/bookings'),

  createBooking: (data) => api.post('/studios/bookings', data),

  updateBookingStatus: (id, status) => api.put(`/studios/bookings/${id}/status`, { status })

}



// ================================================================

// INSTRUMENTS & RENTALS API

// ================================================================

export const instrumentsAPI = {

  getAll: () => api.get('/instruments'),

  create: (data) => api.post('/instruments', data),

  update: (id, data) => api.put(`/instruments/${id}`, data),

  delete: (id) => api.delete(`/instruments/${id}`),

  getRentals: () => api.get('/instruments/rentals/all'),

  createRental: (data) => api.post('/instruments/rentals', data),

  returnRental: (id, data) => api.put(`/instruments/rentals/${id}/return`, data)

}



// ================================================================

// HEALTH CHECK

// ================================================================

export const healthAPI = {

  check: () => api.get('/health')

}



// ================================================================
// AUTH API (student signup, login, session)
// ================================================================

export const studentAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: (id) => api.get(`/auth/me?id=${id}`),
  enroll: (data) => api.post('/enrollment-requests', data)
}

// ================================================================
// FRONTDESK API (student approval workflow)
// ================================================================

export const frontdeskAPI = {
  getPendingEnrollments: () => api.get('/enrollments/pending'),
  approveEnrollment: (id) => api.put(`/enrollments/${id}/approve`),
  rejectEnrollment: (id) => api.put(`/enrollments/${id}/reject`)
}

export default api
