'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  LinearProgress,
  Alert,
  Button,
  Tooltip,
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment,
  Speed,
  Download,
  Refresh,
  FilterList,
  MoreVert,
  Info,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material'
import { fetchBudgetSummary, fetchCompanies } from '@/store/slices/budgetSlice'
import BudgetChart from '@/components/Dashboard/BudgetChart'
import ComparisonChart from '@/components/Dashboard/ComparisonChart'
import RealtimeUpdates from '@/components/Dashboard/RealtimeUpdates'
import type { RootState, AppDispatch } from '@/store/store'
import { useRouter } from 'next/navigation'
import { useIsAdmin, useIsCompanyAdmin, useIsCompanyUser } from '@/hooks/usePermissions'

// Constants
const YEARS = [2024, 2025, 2026]
const REFRESH_INTERVAL = 60000 // 1 minute
const COLORS = {
  primary: '#708472',
  secondary: '#1976d2',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#ed6c02',
}

// Types
interface BudgetSummary {
  monthly_data: Record<string, {
    estimated: number
    actual: number
  }>
}

interface Company {
  id: number
  name: string
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactElement
  trend?: number
  color: string
  percentage?: number
  subtitle?: string
}

// Custom hook for budget calculations
const useBudgetCalculations = (summary: BudgetSummary | null) => {
  return useMemo(() => {
    if (!summary?.monthly_data) return { 
      estimated: 0, 
      actual: 0, 
      variance: 0, 
      percentage: 0,
      status: 'no-data' as const
    }
    
    let estimated = 0
    let actual = 0
    
    Object.values(summary.monthly_data).forEach((month) => {
      estimated += month.estimated || 0
      actual += month.actual || 0
    })
    
    const variance = actual - estimated
    const percentage = estimated > 0 ? ((actual / estimated) * 100) : 0
    
    let status: 'under' | 'on-track' | 'over' | 'no-data' = 'on-track'
    if (percentage < 80) status = 'under'
    else if (percentage > 120) status = 'over'
    
    return {
      estimated,
      actual,
      variance,
      percentage,
      status
    }
  }, [summary])
}

// Enhanced StatCard component
const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color, 
  percentage, 
  subtitle 
}: StatCardProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }
  
  const handleMenuClose = () => {
    setMenuAnchor(null)
  }
  
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          borderColor: color,
          transform: 'translateY(-2px)'
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} fontSize="0.75rem">
              {title}
            </Typography>
            <Typography variant="h6" fontWeight="600" sx={{ mt: 0.5, color: 'text.primary', fontSize: '1.25rem' }}>
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${color}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: 20, color: color } })}
            </Box>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {percentage !== undefined && (
          <Box mt={1.5}>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
              {percentage.toFixed(1)}% نسبة التنفيذ
            </Typography>
          </Box>
        )}

        {trend !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5} mt={1}>
            {trend >= 0 ? (
              <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend >= 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            >
              {Math.abs(trend).toLocaleString('ar-SA')}
            </Typography>
          </Box>
        )}
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Info fontSize="small" />
            </ListItemIcon>
            <ListItemText>عرض التفاصيل</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>تصدير البيانات</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Refresh fontSize="small" />
            </ListItemIcon>
            <ListItemText>تحديث</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  )
}

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'under':
        return { 
          icon: <Warning />, 
          color: COLORS.warning, 
          text: 'أقل من المستهدف' 
        }
      case 'over':
        return { 
          icon: <Error />, 
          color: COLORS.error, 
          text: 'أعلى من المستهدف' 
        }
      case 'on-track':
        return { 
          icon: <CheckCircle />, 
          color: COLORS.success, 
          text: 'في المسار الصحيح' 
        }
      default:
        return { 
          icon: <Info />, 
          color: 'text.secondary', 
          text: 'لا توجد بيانات' 
        }
    }
  }
  
  const { icon, color, text } = getStatusInfo()
  
  return (
    <Chip
      icon={React.cloneElement(icon, { fontSize: 'small' })}
      label={text}
      size="small"
      sx={{
        bgcolor: `${color}15`,
        color,
        fontWeight: 500,
        '& .MuiChip-icon': {
          color,
        }
      }}
    />
  )
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCompany, setSelectedCompany] = useState<number | 'all'>('all')
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { summary, loading } = useSelector((state: RootState) => state.budgets)
  const { items: companies } = useSelector((state: RootState) => state.companies)
  const { user } = useSelector((state: RootState) => state.auth)
  
  const isAdmin = useIsAdmin()
  const isCompanyAdmin = useIsCompanyAdmin()
  const isCompanyUser = useIsCompanyUser()
  
  // Redirect company users to company home
  useEffect(() => {
    if (isCompanyAdmin || isCompanyUser) {
      router.push('/company-home')
    }
  }, [isCompanyAdmin, isCompanyUser, router])
  
  const totals = useBudgetCalculations(summary)
  
  // Fetch companies on mount
  useEffect(() => {
    dispatch(fetchCompanies())
      .unwrap()
      .catch((err) => setError('فشل في تحميل بيانات الشركات'))
  }, [dispatch])
  
  // Fetch budget summary when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const companyId = selectedCompany === 'all' ? undefined : selectedCompany
        await dispatch(fetchBudgetSummary({ year: selectedYear, companyId })).unwrap()
        setLastRefreshTime(new Date())
      } catch (err) {
        setError('فشل في تحميل بيانات الموازنة')
      }
    }
    
    fetchData()
  }, [dispatch, selectedYear, selectedCompany])
  
  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      const companyId = selectedCompany === 'all' ? undefined : selectedCompany
      dispatch(fetchBudgetSummary({ year: selectedYear, companyId }))
        .unwrap()
        .then(() => setLastRefreshTime(new Date()))
        .catch(() => setError('فشل في تحديث البيانات'))
    }, REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [autoRefresh, dispatch, selectedYear, selectedCompany])
  
  const handleRefresh = useCallback(() => {
    const companyId = selectedCompany === 'all' ? undefined : selectedCompany
    dispatch(fetchBudgetSummary({ year: selectedYear, companyId }))
      .unwrap()
      .then(() => setLastRefreshTime(new Date()))
      .catch(() => setError('فشل في تحديث البيانات'))
  }, [dispatch, selectedYear, selectedCompany])
  
  const handleExportData = useCallback(() => {
    // Implementation for data export
    console.log('Exporting data...')
  }, [])
  
  if (loading && !summary) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          جاري تحميل البيانات...
        </Typography>
      </Box>
    )
  }
  
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1200px', 
      mx: 'auto',
      px: 2
    }}>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight="700" color="text.primary">
            لوحة التحكم
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            نظرة شاملة على الموازنات والأداء المالي
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Typography variant="caption" color="text.secondary">
              آخر تحديث: {lastRefreshTime.toLocaleTimeString('ar-SA')}
            </Typography>
            <StatusIndicator status={totals.status} />
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title={autoRefresh ? "إيقاف التحديث التلقائي" : "تفعيل التحديث التلقائي"}>
            <Button
              variant={autoRefresh ? "contained" : "outlined"}
              size="small"
              startIcon={<Refresh />}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              تحديث تلقائي
            </Button>
          </Tooltip>
          
          <Tooltip title="تحديث البيانات">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="تصدير البيانات">
            <IconButton onClick={handleExportData}>
              <Download />
            </IconButton>
          </Tooltip>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>السنة</InputLabel>
            <Select
              value={selectedYear}
              label="السنة"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {YEARS.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>الشركة</InputLabel>
            <Select
              value={selectedCompany}
              label="الشركة"
              onChange={(e) => setSelectedCompany(e.target.value as number | 'all')}
            >
              <MenuItem value="all">جميع الشركات</MenuItem>
              {companies.map((company: Company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              إعادة المحاولة
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3} sx={{ justifyContent: 'center' }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="الموازنة التقريبية"
            value={totals.estimated}
            icon={<AccountBalance />}
            color={COLORS.primary}
            subtitle="الإجمالي المخطط"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="الموازنة الفعلية"
            value={totals.actual}
            icon={<Assessment />}
            color={COLORS.secondary}
            subtitle="الإجمالي المنفق"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="الفرق"
            value={totals.variance}
            icon={totals.variance >= 0 ? <TrendingUp /> : <TrendingDown />}
            trend={totals.variance}
            color={totals.variance >= 0 ? COLORS.success : COLORS.error}
            subtitle={totals.variance >= 0 ? "زيادة" : "نقصان"}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="نسبة التنفيذ"
            value={`${totals.percentage.toFixed(1)}%`}
            icon={<Speed />}
            percentage={totals.percentage}
            color={COLORS.warning}
            subtitle={totals.status === 'on-track' ? "ممتاز" : totals.status === 'over' ? "تجاوز الحد" : "أقل من المتوقع"}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  مقارنة الموازنات الشهرية
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  التقريبية مقابل الفعلية
                </Typography>
              </Box>
              <Tooltip title="تصدير الرسم البياني">
                <IconButton size="small">
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 300 }}>
              <BudgetChart data={summary?.monthly_data || {}} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              التحديثات الحية
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
              آخر التحديثات على النظام
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 300 }}>
              <RealtimeUpdates />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              width: '100%',
              maxWidth: '800px'
            }}
          >
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  تحليل الأداء
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  تحليل مفصل للاتجاهات والأنماط
                </Typography>
              </Box>
              <Button 
                size="small" 
                startIcon={<FilterList />}
                variant="outlined"
              >
                تصفية
              </Button>
            </Box>
            <Box sx={{ minHeight: 300 }}>
              <ComparisonChart data={summary?.monthly_data || {}} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}