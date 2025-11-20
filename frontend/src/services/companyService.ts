import api from './api'

const companyService = {
  getCompanies: (params = {}) => {
    return api.get('/companies', { params })
  },

  getCompany: (id: number) => {
    return api.get(`/companies/${id}`)
  },

  createCompany: (data: any) => {
    return api.post('/companies', data)
  },

  updateCompany: (id: number, data: any) => {
    return api.put(`/companies/${id}`, data)
  },

  deleteCompany: (id: number) => {
    return api.delete(`/companies/${id}`)
  },
}

export default companyService

