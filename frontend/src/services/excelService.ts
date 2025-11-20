import api from './api'

export interface ExcelUploadResponse {
  success: boolean
  message: string
  created_count: number
  errors: string[]
}

export interface ExcelValidationResponse {
  valid: boolean
  message: string
  errors: string[]
  required_columns: string[]
  found_columns: string[]
  row_count: number
}

class ExcelService {
  async validateTemplate(file: File): Promise<ExcelValidationResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/excel/validate-template', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  async uploadAccounts(file: File): Promise<ExcelUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/excel/upload-accounts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  async downloadTemplate(): Promise<Blob> {
    const response = await api.get('/excel/template', {
      responseType: 'blob',
    })
    
    return response.data
  }
}

export const excelService = new ExcelService()
