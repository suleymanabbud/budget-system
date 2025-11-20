import api from './api'

const budgetService = {
  getBudgets: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    return api.get(`/budgets?${params.toString()}`)
  },

  getBudget: (id: number) => {
    return api.get(`/budgets/${id}`)
  },

  createBudget: (data: any) => {
    return api.post('/budgets', data)
  },

  updateBudget: (id: number, data: any) => {
    return api.put(`/budgets/${id}`, data)
  },

  deleteBudget: (id: number) => {
    return api.delete(`/budgets/${id}`)
  },

  getBudgetSummary: (year: number, companyId?: number) => {
    const params = companyId ? `?company_id=${companyId}` : ''
    return api.get(`/budgets/summary/${year}${params}`)
  },
}

export default budgetService

