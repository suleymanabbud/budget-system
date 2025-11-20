import api from './api'

const productService = {
  getProducts: (params = {}) => {
    return api.get('/products', { params })
  },

  getProduct: (id: number) => {
    return api.get(`/products/${id}`)
  },

  createProduct: (data: any) => {
    return api.post('/products', data)
  },

  updateProduct: (id: number, data: any) => {
    return api.put(`/products/${id}`, data)
  },

  deleteProduct: (id: number) => {
    return api.delete(`/products/${id}`)
  },
}

export default productService

