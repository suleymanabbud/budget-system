import { configureStore } from '@reduxjs/toolkit'
import budgetReducer from './slices/budgetSlice'
import companyReducer from './slices/companySlice'
import productReducer from './slices/productSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    budgets: budgetReducer,
    companies: companyReducer,
    products: productReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

