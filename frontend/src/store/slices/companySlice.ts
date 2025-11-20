import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import companyService from '@/services/companyService'

interface Company {
  id: number
  name: string
  code: string
  [key: string]: any
}

export const fetchCompanies = createAsyncThunk(
  'companies/fetchAll',
  async () => {
    const response = await companyService.getCompanies()
    return response.data
  }
)

export const createCompany = createAsyncThunk(
  'companies/create',
  async (companyData: any) => {
    const response = await companyService.createCompany(companyData)
    return response.data
  }
)

export const updateCompany = createAsyncThunk(
  'companies/update',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await companyService.updateCompany(id, data)
    return response.data
  }
)

export const deleteCompany = createAsyncThunk(
  'companies/delete',
  async (id: number) => {
    await companyService.deleteCompany(id)
    return id
  }
)

const companySlice = createSlice({
  name: 'companies',
  initialState: {
    items: [] as Company[],
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
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error fetching companies'
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.items.push(action.payload as Company)
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.items.findIndex((item: Company) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload as Company
        }
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.items = state.items.filter((item: Company) => item.id !== action.payload)
      })
  },
})

export const { clearError } = companySlice.actions
export default companySlice.reducer

