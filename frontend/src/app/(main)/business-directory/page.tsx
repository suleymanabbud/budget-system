'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Paper,
} from '@mui/material'
import {
  Business,
  TrendingUp,
  Visibility,
  Edit,
} from '@mui/icons-material'
import { fetchCompanies } from '@/store/slices/companySlice'
import type { RootState, AppDispatch } from '@/store/store'

export default function BusinessDirectory() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { items: companies, loading } = useSelector((state: RootState) => state.companies)

  useEffect(() => {
    dispatch(fetchCompanies())
  }, [dispatch])

  const handleViewBudgets = (companyId: number) => {
    router.push(`/budget-entry/${companyId}`)
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Business sx={{ fontSize: 50 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              دليل الأعمال - Business Directory
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              جميع الشركات المسجلة في النظام ({companies.length} شركة)
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {companies.map((company: any) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Business color="primary" sx={{ fontSize: 40 }} />
                  <Chip
                    label={company.is_active ? 'نشط' : 'غير نشط'}
                    color={company.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {company.name}
                </Typography>

                {company.name_en && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {company.name_en}
                  </Typography>
                )}

                <Box my={2}>
                  <Chip
                    label={`كود: ${company.code}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {company.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {company.description}
                  </Typography>
                )}

                <Box mt={2} display="flex" gap={1}>
                  <Chip
                    icon={<TrendingUp />}
                    label="موازنات نشطة"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => handleViewBudgets(company.id)}
                >
                  إدارة الموازنات
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {companies.length === 0 && !loading && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Business sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            لا توجد شركات مسجلة في النظام
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            يرجى إضافة الشركات من قسم إدارة الشركات
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

