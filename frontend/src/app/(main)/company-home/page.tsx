'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  AccountBalance,
  Business,
  TrendingUp,
  TrendingDown,
  Assessment,
  People,
  Settings,
  Refresh,
  Notifications,
  Star,
  Timeline,
  PieChart
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useIsCompanyAdmin, useIsCompanyUser } from '@/hooks/usePermissions'

export default function CompanyHomePage() {
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const isCompanyAdmin = useIsCompanyAdmin()
  const isCompanyUser = useIsCompanyUser()
  
  const [stats, setStats] = useState({
    totalBudget: 2500000,
    actualSpent: 1800000,
    remainingBudget: 700000,
    budgetUtilization: 72,
    activeProjects: 12,
    completedTasks: 45,
    pendingApprovals: 3
  })

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const handleRefresh = () => {
    // Simulate data refresh
    setStats(prev => ({
      ...prev,
      budgetUtilization: Math.min(100, prev.budgetUtilization + Math.random() * 5)
    }))
  }

  if (!isCompanyAdmin && !isCompanyUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          مرحباً بك في نظام إدارة الموازنات
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {user?.full_name}
        </Typography>
        <Chip 
          label={user?.role === 'company_admin' ? 'مدير الشركة' : 'مستخدم الشركة'}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Main Card - Budget Systems */}
      <Card 
        sx={{ 
          mb: 4,
          background: 'linear-gradient(135deg, #708472 0%, #5a6b5d 100%)',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
        onClick={() => handleNavigate('/budget-systems')}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 60, height: 60 }}>
              <AccountBalance sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                أنظمة الموازنة
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                إدارة موازنات الشركة والحسابات المالية
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
            قم بإدارة موازنات الشركة من خلال الحسابات التجارية والاستثمارية
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            الدخول إلى أنظمة الموازنة
          </Button>
        </CardContent>
      </Card>

    </Box>
  )
}
