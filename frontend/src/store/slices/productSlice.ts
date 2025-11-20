import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from '@/services/productService'

interface Product {
  id: number
  name: string
  code: string
  [key: string]: any
}

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async () => {
    const response = await productService.getProducts()
    return response.data
  }
)

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: any) => {
    const response = await productService.createProduct(productData)
    return response.data
  }
)

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }: { id: number; data: any }) => {
    const response = await productService.updateProduct(id, data)
    return response.data
  }
)

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: number) => {
    await productService.deleteProduct(id)
    return id
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [] as Product[],
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
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error fetching products'
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload as Product)
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((item: Product) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload as Product
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item: Product) => item.id !== action.payload)
      })
  },
})

export const { clearError } = productSlice.actions
export default productSlice.reducer

