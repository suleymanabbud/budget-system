import api from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  full_name: string
  password: string
  role?: string
  company_id?: number
}

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: 'admin' | 'company_admin' | 'company_user' | 'viewer' | 'ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_USER' | 'VIEWER'
  company_id?: number
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface PasswordChangeData {
  current_password: string
  new_password: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('AuthService: محاولة تسجيل الدخول', credentials)
    console.log('AuthService: API URL:', api.defaults.baseURL)
    console.log('AuthService: Full URL:', api.defaults.baseURL + '/auth/login')
    
    try {
      const response = await api.post('/auth/login', credentials)
      console.log('AuthService: استجابة ناجحة', response.data)
      return response.data
    } catch (error) {
      console.error('AuthService: خطأ في الطلب', error)
      throw error
    }
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await api.post('/auth/register', userData)
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

  async changePassword(passwordData: PasswordChangeData): Promise<{ message: string }> {
    const response = await api.post('/auth/change-password', passwordData)
    return response.data
  }

  async getCompanyUsers(): Promise<User[]> {
    const response = await api.get('/auth/company-users')
    return response.data
  }

  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/auth/users')
    return response.data
  }

  async activateUser(userId: number): Promise<{ message: string }> {
    const response = await api.put(`/auth/users/${userId}/activate`)
    return response.data
  }

  async deactivateUser(userId: number): Promise<{ message: string }> {
    const response = await api.put(`/auth/users/${userId}/deactivate`)
    return response.data
  }
}

export const authService = new AuthService()
