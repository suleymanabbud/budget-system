'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Assessment, FileDownload, Print } from '@mui/icons-material'
import { fetchBudgets } from '@/store/slices/budgetSlice'
import { fetchCompanies } from '@/store/slices/companySlice'
import type { RootState, AppDispatch } from '@/store/store'

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCompany, setSelectedCompany] = useState<number | 'all'>('all')
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all')
  
  const { items: budgets } = useSelector((state: RootState) => state.budgets)
  const { items: companies } = useSelector((state: RootState) => state.companies)

  useEffect(() => {
    dispatch(fetchCompanies())
  }, [dispatch])

  useEffect(() => {
    const filters: any = { year: selectedYear }
    if (selectedCompany !== 'all') filters.company_id = selectedCompany
    if (selectedMonth !== 'all') filters.month = selectedMonth
    
    dispatch(fetchBudgets(filters))
  }, [dispatch, selectedYear, selectedCompany, selectedMonth])

  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // TODO: Implement export to Excel
    alert('سيتم إضافة تصدير Excel قريباً')
  }

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          التقارير والإحصائيات
        </Typography>
        
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
            طباعة
          </Button>
          <Button variant="contained" startIcon={<FileDownload />} onClick={handleExport}>
            تصدير Excel
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>السنة</InputLabel>
              <Select
                value={selectedYear}
                label="السنة"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>الشركة</InputLabel>
              <Select
                value={selectedCompany}
                label="الشركة"
                onChange={(e) => setSelectedCompany(e.target.value as number | 'all')}
              >
                <MenuItem value="all">جميع الشركات</MenuItem>
                {companies.map((company: any) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>الشهر</InputLabel>
              <Select
                value={selectedMonth}
                label="الشهر"
                onChange={(e) => setSelectedMonth(e.target.value as number | 'all')}
              >
                <MenuItem value="all">جميع الأشهر</MenuItem>
                {months.map((month, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                إجمالي الموازنات التقريبية
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {budgets
                  .filter((b: any) => b.budget_type === 'estimated')
                  .reduce((sum: number, b: any) => sum + (b.total || 0), 0)
                  .toLocaleString('ar-SA')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                إجمالي الموازنات الفعلية
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {budgets
                  .filter((b: any) => b.budget_type === 'actual')
                  .reduce((sum: number, b: any) => sum + (b.total || 0), 0)
                  .toLocaleString('ar-SA')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                عدد الموازنات
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {budgets.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                عدد الشركات
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {companies.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#708472 !important' }}>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الشركة</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الشهر</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>نوع الموازنة</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الكمية</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>السعر</TableCell>
              <TableCell sx={{ color: 'white !important', fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#708472 !important' }}>الإجمالي</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.slice(0, 50).map((budget: any) => (
              <TableRow key={budget.id}>
                <TableCell>{budget.company_id}</TableCell>
                <TableCell>{months[budget.month - 1]}</TableCell>
                <TableCell>
                  {budget.budget_type === 'estimated' ? 'تقريبية' : 'فعلية'}
                </TableCell>
                <TableCell>{budget.quantity}</TableCell>
                <TableCell>{budget.price.toLocaleString('ar-SA')}</TableCell>
                <TableCell>
                  <strong>{budget.total.toLocaleString('ar-SA')}</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

