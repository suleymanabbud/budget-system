import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import budgetService from '@/services/budgetService'
import { fetchCompanies } from './companySlice'

export { fetchCompanies }

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async (filters: any = {}) => {
    const response = await budgetService.getBudgets(filters)
    return response.data
  }
)

export const fetchBudgetSummary = createAsyncThunk(
  'budgets/fetchSummary',
  async ({ year, companyId }: { year: number; companyId?: number }) => {
    const response = await budgetService.getBudgetSummary(year, companyId)
    return response.data
  }
)

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (budgetData: any) => {
    const response = await budgetService.createBudget(budgetData)
    return response.data
  }
)

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await budgetService.updateBudget(id, data)
    return response.data
  }
)

export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id: number) => {
    await budgetService.deleteBudget(id)
    return id
  }
)

const budgetSlice = createSlice({
  name: 'budgets',
  initialState: {
    items: [],
    summary: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error fetching budgets'
      })
      // Fetch summary
      .addCase(fetchBudgetSummary.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchBudgetSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
      })
      .addCase(fetchBudgetSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error fetching summary'
      })
      // Create budget
      .addCase(createBudget.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.items.findIndex((item: any) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.items = state.items.filter((item: any) => item.id !== action.payload)
      })
  },
})

export const { clearError } = budgetSlice.actions
export default budgetSlice.reducer

