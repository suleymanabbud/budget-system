import axios from 'axios'

// Use /budget-api in production (when basePath is set), otherwise use localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.pathname.startsWith('/budget') 
    ? '/budget-api/v1' 
    : 'http://localhost:8000/api/v1')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.log('401 Unauthorized - redirecting to login')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/budget') ? '/budget' : ''
        window.location.href = `${basePath}/login`
      }
    }
    return Promise.reject(error)
  }
)

export default api

