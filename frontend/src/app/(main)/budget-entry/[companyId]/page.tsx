'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent,
} from '@mui/material'
import { Add, Delete, Save, BusinessCenter } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { fetchCompanies } from '@/store/slices/companySlice'
import { fetchProducts } from '@/store/slices/productSlice'
import { createBudget, fetchBudgets } from '@/store/slices/budgetSlice'
import type { RootState, AppDispatch } from '@/store/store'

interface BudgetRow {
  year: number
  quarter: string
  month: number
  product_id: number
  budget_type: 'estimated' | 'actual'
  quantity: number
  price: number
  notes: string
}

export default function BudgetEntry() {
  const params = useParams()
  const companyId = Number(params.companyId)
  const dispatch = useDispatch<AppDispatch>()
  
  const { items: companies } = useSelector((state: RootState) => state.companies)
  const { items: products } = useSelector((state: RootState) => state.products)
  
  const [budgetRows, setBudgetRows] = useState<BudgetRow[]>([
    {
      year: new Date().getFullYear(),
      quarter: 'Q1',
      month: 1,
      product_id: 0,
      budget_type: 'estimated',
      quantity: 0,
      price: 0,
      notes: '',
    },
  ])

  const company = companies.find((c: any) => c.id === companyId)

  useEffect(() => {
    dispatch(fetchCompanies())
    dispatch(fetchProducts())
  }, [dispatch])

  const addRow = () => {
    setBudgetRows([
      ...budgetRows,
      {
        year: new Date().getFullYear(),
        quarter: 'Q1',
        month: 1,
        product_id: 0,
        budget_type: 'estimated',
        quantity: 0,
        price: 0,
        notes: '',
      },
    ])
  }

  const removeRow = (index: number) => {
    setBudgetRows(budgetRows.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, field: keyof BudgetRow, value: any) => {
    const newRows = [...budgetRows]
    newRows[index] = { ...newRows[index], [field]: value }
    setBudgetRows(newRows)
  }

  const calculateTotal = (quantity: number, price: number) => {
    return (quantity * price).toFixed(2)
  }

  const handleSubmitAll = async () => {
    try {
      for (const row of budgetRows) {
        if (!row.product_id) {
          toast.error('يرجى اختيار المنتج لجميع الصفوف')
          return
        }
        
        await dispatch(
          createBudget({
            ...row,
            company_id: companyId,
          })
        ).unwrap()
      }
      
      toast.success('تم حفظ الموازنات بنجاح')
      setBudgetRows([
        {
          year: new Date().getFullYear(),
          quarter: 'Q1',
          month: 1,
          product_id: 0,
          budget_type: 'estimated',
          quantity: 0,
          price: 0,
          notes: '',
        },
      ])
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    }
  }

  const quarters = [
    { value: 'Q1', label: 'الربع الأول' },
    { value: 'Q2', label: 'الربع الثاني' },
    { value: 'Q3', label: 'الربع الثالث' },
    { value: 'Q4', label: 'الربع الرابع' },
  ]

  const months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
  ]

  return (
    <Box>
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <BusinessCenter sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                إدخال الموازنات - {company?.name || 'الشركة'}
              </Typography>
              <Typography variant="body2">
                كود الشركة: {company?.code}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            إدخال بيانات الموازنة
          </Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Add />} onClick={addRow}>
              إضافة صف
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmitAll}
              disabled={budgetRows.length === 0}
            >
              حفظ الكل
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#708472 !important' }}>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>السنة</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الربع</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الشهر</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>المنتج</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>نوع الموازنة</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الكمية</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>السعر</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الإجمالي</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>ملاحظات</TableCell>
                <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>حذف</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      type="number"
                      value={row.year}
                      onChange={(e) => updateRow(index, 'year', Number(e.target.value))}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.quarter}
                      onChange={(e) => updateRow(index, 'quarter', e.target.value)}
                      size="small"
                      sx={{ width: 120 }}
                    >
                      {quarters.map((q) => (
                        <MenuItem key={q.value} value={q.value}>
                          {q.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.month}
                      onChange={(e) => updateRow(index, 'month', Number(e.target.value))}
                      size="small"
                      sx={{ width: 120 }}
                    >
                      {months.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.product_id}
                      onChange={(e) => updateRow(index, 'product_id', Number(e.target.value))}
                      size="small"
                      sx={{ width: 150 }}
                    >
                      <MenuItem value={0}>اختر المنتج</MenuItem>
                      {products.map((product: any) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.budget_type}
                      onChange={(e) => updateRow(index, 'budget_type', e.target.value)}
                      size="small"
                      sx={{ width: 120 }}
                    >
                      <MenuItem value="estimated">تقريبية</MenuItem>
                      <MenuItem value="actual">فعلية</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={row.quantity}
                      onChange={(e) => updateRow(index, 'quantity', Number(e.target.value))}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={row.price}
                      onChange={(e) => updateRow(index, 'price', Number(e.target.value))}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {calculateTotal(row.quantity, row.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={row.notes}
                      onChange={(e) => updateRow(index, 'notes', e.target.value)}
                      size="small"
                      sx={{ width: 150 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeRow(index)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

