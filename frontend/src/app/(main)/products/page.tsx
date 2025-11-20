'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import { Add, Edit, Delete, Inventory } from '@mui/icons-material'
import { toast } from 'react-toastify'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/store/slices/productSlice'
import type { RootState, AppDispatch } from '@/store/store'

interface ProductForm {
  name: string
  name_en: string
  code: string
  unit_of_measurement: string
  description: string
  is_active: boolean
}

export default function ProductManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: products, loading } = useSelector((state: RootState) => state.products)
  
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    name_en: '',
    code: '',
    unit_of_measurement: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name,
        name_en: product.name_en || '',
        code: product.code,
        unit_of_measurement: product.unit_of_measurement,
        description: product.description || '',
        is_active: product.is_active,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        name_en: '',
        code: '',
        unit_of_measurement: '',
        description: '',
        is_active: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await dispatch(updateProduct({ id: editingId, data: formData })).unwrap()
        toast.success('تم تحديث المنتج بنجاح')
      } else {
        await dispatch(createProduct(formData)).unwrap()
        toast.success('تم إضافة المنتج بنجاح')
      }
      handleCloseDialog()
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await dispatch(deleteProduct(id)).unwrap()
        toast.success('تم حذف المنتج بنجاح')
      } catch (error) {
        toast.error('حدث خطأ أثناء الحذف')
      }
    }
  }

  const unitOptions = ['قطعة', 'كيلوجرام', 'متر', 'لتر', 'صندوق', 'طن', 'غرام']

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
          إدارة المنتجات
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          إضافة منتج جديد
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#708472 !important' }}>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الكود</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>اسم المنتج</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الاسم بالإنجليزية</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>وحدة القياس</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الوصف</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الحالة</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.name_en || '-'}</TableCell>
                <TableCell>
                  <Chip label={product.unit_of_measurement} size="small" color="info" />
                </TableCell>
                <TableCell>{product.description || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={product.is_active ? 'نشط' : 'غير نشط'}
                    color={product.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="اسم المنتج (عربي)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="اسم المنتج (English)"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              fullWidth
            />
            <TextField
              label="كود المنتج"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="وحدة القياس"
              value={formData.unit_of_measurement}
              onChange={(e) => setFormData({ ...formData, unit_of_measurement: e.target.value })}
              fullWidth
              required
              select
              SelectProps={{ native: true }}
            >
              <option value="">اختر وحدة القياس</option>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </TextField>
            <TextField
              label="الوصف"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

