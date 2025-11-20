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
import { Add, Edit, Delete, Business } from '@mui/icons-material'
import { toast } from 'react-toastify'
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '@/store/slices/companySlice'
import type { RootState, AppDispatch } from '@/store/store'

interface CompanyForm {
  name: string
  name_en: string
  code: string
  description: string
  is_active: boolean
}

export default function CompanyManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: companies, loading } = useSelector((state: RootState) => state.companies)
  
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CompanyForm>({
    name: '',
    name_en: '',
    code: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    dispatch(fetchCompanies())
  }, [dispatch])

  const handleOpenDialog = (company?: any) => {
    if (company) {
      setEditingId(company.id)
      setFormData({
        name: company.name,
        name_en: company.name_en || '',
        code: company.code,
        description: company.description || '',
        is_active: company.is_active,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        name_en: '',
        code: '',
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
        await dispatch(updateCompany({ id: editingId, data: formData })).unwrap()
        toast.success('تم تحديث الشركة بنجاح')
      } else {
        await dispatch(createCompany(formData)).unwrap()
        toast.success('تم إضافة الشركة بنجاح')
      }
      handleCloseDialog()
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الشركة؟')) {
      try {
        await dispatch(deleteCompany(id)).unwrap()
        toast.success('تم حذف الشركة بنجاح')
      } catch (error) {
        toast.error('حدث خطأ أثناء الحذف')
      }
    }
  }

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
          إدارة الشركات
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          إضافة شركة جديدة
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>الكود</strong></TableCell>
              <TableCell><strong>اسم الشركة</strong></TableCell>
              <TableCell><strong>الاسم بالإنجليزية</strong></TableCell>
              <TableCell><strong>الوصف</strong></TableCell>
              <TableCell><strong>الحالة</strong></TableCell>
              <TableCell><strong>الإجراءات</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company: any) => (
              <TableRow key={company.id}>
                <TableCell>{company.code}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.name_en || '-'}</TableCell>
                <TableCell>{company.description || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={company.is_active ? 'نشط' : 'غير نشط'}
                    color={company.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(company)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(company.id)}
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
          {editingId ? 'تعديل الشركة' : 'إضافة شركة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="اسم الشركة (عربي)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="اسم الشركة (English)"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              fullWidth
            />
            <TextField
              label="كود الشركة"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              required
            />
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

