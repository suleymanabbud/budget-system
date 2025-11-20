'use client'

import React from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, Avatar } from '@mui/material'
import { useRouter } from 'next/navigation'
import {
  AccountBalance,
  Assessment,
  TrendingUp,
  Business,
  Settings,
  Description,
  People,
  Analytics
} from '@mui/icons-material'

export default function CompanyDashboard() {
  const router = useRouter()

  const dashboardCards = [
    {
      title: 'نظام الموازنة',
      description: 'إدارة الموازنات والحسابات المالية',
      icon: <AccountBalance />,
      color: '#708472',
      path: '/company-dashboard/budget-management',
      features: ['شجرة الحسابات', 'إدخال الموازنات', 'متابعة التنفيذ']
    },
    {
      title: 'التقارير المالية',
      description: 'تقارير مفصلة عن الأداء المالي',
      icon: <Assessment />,
      color: '#A3B1A4',
      path: '/company-dashboard/financial-reports',
      features: ['تقارير دورية', 'تحليل الاتجاهات', 'مؤشرات الأداء']
    },
    {
      title: 'إدارة المنتجات',
      description: 'إدارة منتجات الشركة وخدماتها',
      icon: <Business />,
      color: '#1D1D1B',
      path: '/company-dashboard/products',
      features: ['قائمة المنتجات', 'تحديث الأسعار', 'متابعة المبيعات']
    },
    {
      title: 'التحليلات',
      description: 'تحليل البيانات والمؤشرات',
      icon: <Analytics />,
      color: '#3D3935',
      path: '/company-dashboard/analytics',
      features: ['تحليل الاتجاهات', 'مؤشرات الأداء', 'التوقعات']
    },
    {
      title: 'المستندات',
      description: 'إدارة المستندات والملفات',
      icon: <Description />,
      color: '#898A8D',
      path: '/company-dashboard/documents',
      features: ['رفع المستندات', 'التصنيف', 'البحث']
    },
    {
      title: 'إدارة الفريق',
      description: 'إدارة أعضاء الفريق والصلاحيات',
      icon: <People />,
      color: '#C8C8C8',
      path: '/company-dashboard/team',
      features: ['إدارة المستخدمين', 'تحديد الصلاحيات', 'متابعة النشاط']
    }
  ]

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1200px', 
      mx: 'auto',
      px: 2
    }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          لوحة تحكم الشركة
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مرحباً بك في نظام إدارة الشركة - اختر الخدمة التي تريد الوصول إليها
        </Typography>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => router.push(card.path)}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    المميزات:
                  </Typography>
                  {card.features.map((feature, featureIndex) => (
                    <Typography
                      key={featureIndex}
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 0.5,
                        '&:before': {
                          content: '"•"',
                          mr: 1,
                          color: card.color,
                          fontWeight: 'bold'
                        }
                      }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: card.color,
                    '&:hover': {
                      bgcolor: card.color,
                      opacity: 0.9,
                    },
                    mt: 'auto'
                  }}
                >
                  الدخول
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          إجراءات سريعة
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                إضافة موازنة سريعة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إدخال موازنة جديدة بسرعة
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                تقرير فوري
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إنشاء تقرير سريع
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Settings sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                الإعدادات
              </Typography>
              <Typography variant="body2" color="text.secondary">
                تعديل إعدادات الشركة
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                إدارة الفريق
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إدارة المستخدمين
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
