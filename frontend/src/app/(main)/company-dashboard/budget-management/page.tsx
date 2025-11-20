'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TreeView,
  TreeItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  ExpandMore,
  ChevronRight,
  AccountBalance,
  Add,
  Edit,
  Save,
  Cancel,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material'

interface Account {
  id: number
  code: string
  name: string
  account_type: string
  level: number
  is_leaf: boolean
  is_budgetable: boolean
  children?: Account[]
  budget?: {
    estimated: number
    actual: number
  }
}

export default function BudgetManagement() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [budgetDialog, setBudgetDialog] = useState(false)
  const [budgetData, setBudgetData] = useState({
    estimated: 0,
    actual: 0,
    notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const mockAccounts: Account[] = [
      {
        id: 1,
        code: '1000',
        name: 'الأصول',
        account_type: 'asset',
        level: 1,
        is_leaf: false,
        is_budgetable: false,
        children: [
          {
            id: 11,
            code: '1100',
            name: 'الأصول المتداولة',
            account_type: 'asset',
            level: 2,
            is_leaf: false,
            is_budgetable: false,
            children: [
              {
                id: 111,
                code: '1110',
                name: 'النقدية',
                account_type: 'asset',
                level: 3,
                is_leaf: true,
                is_budgetable: true,
                budget: { estimated: 50000, actual: 48000 }
              },
              {
                id: 112,
                code: '1120',
                name: 'البنوك',
                account_type: 'asset',
                level: 3,
                is_leaf: true,
                is_budgetable: true,
                budget: { estimated: 100000, actual: 95000 }
              }
            ]
          }
        ]
      },
      {
        id: 2,
        code: '2000',
        name: 'الخصوم',
        account_type: 'liability',
        level: 1,
        is_leaf: false,
        is_budgetable: false,
        children: [
          {
            id: 21,
            code: '2100',
            name: 'الخصوم المتداولة',
            account_type: 'liability',
            level: 2,
            is_leaf: false,
            is_budgetable: false,
            children: [
              {
                id: 211,
                code: '2110',
                name: 'الموردين',
                account_type: 'liability',
                level: 3,
                is_leaf: true,
                is_budgetable: true,
                budget: { estimated: 30000, actual: 28000 }
              }
            ]
          }
        ]
      },
      {
        id: 3,
        code: '4000',
        name: 'الإيرادات',
        account_type: 'revenue',
        level: 1,
        is_leaf: false,
        is_budgetable: false,
        children: [
          {
            id: 31,
            code: '4100',
            name: 'إيرادات المبيعات',
            account_type: 'revenue',
            level: 2,
            is_leaf: true,
            is_budgetable: true,
            budget: { estimated: 200000, actual: 180000 }
          }
        ]
      },
      {
        id: 4,
        code: '5000',
        name: 'المصروفات',
        account_type: 'expense',
        level: 1,
        is_leaf: false,
        is_budgetable: false,
        children: [
          {
            id: 41,
            code: '5100',
            name: 'مصروفات التشغيل',
            account_type: 'expense',
            level: 2,
            is_leaf: true,
            is_budgetable: true,
            budget: { estimated: 50000, actual: 45000 }
          }
        ]
      }
    ]
    
    setAccounts(mockAccounts)
    setLoading(false)
  }, [])

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: '#4caf50',
      liability: '#f44336',
      equity: '#2196f3',
      revenue: '#ff9800',
      expense: '#9c27b0'
    }
    return colors[type as keyof typeof colors] || '#666'
  }

  const getAccountTypeLabel = (type: string) => {
    const labels = {
      asset: 'أصول',
      liability: 'خصوم',
      equity: 'حقوق ملكية',
      revenue: 'إيرادات',
      expense: 'مصروفات'
    }
    return labels[type as keyof typeof labels] || type
  }

  const renderAccountTree = (account: Account) => {
    const hasChildren = account.children && account.children.length > 0
    const isBudgetable = account.is_budgetable && account.is_leaf

    return (
      <TreeItem
        key={account.id}
        nodeId={account.id.toString()}
        label={
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" flex={1}>
              <Box mr={2}>
                <Typography variant="body2" fontWeight="bold">
                  {account.code}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body1" fontWeight={account.is_leaf ? 600 : 500}>
                  {account.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Chip
                    label={getAccountTypeLabel(account.account_type)}
                    size="small"
                    sx={{
                      bgcolor: getAccountTypeColor(account.account_type),
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                  {isBudgetable && (
                    <Chip
                      label="قابل للموازنة"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
            {isBudgetable && (
              <Box display="flex" alignItems="center" gap={1}>
                {account.budget && (
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      متوقع: {account.budget.estimated.toLocaleString('ar-SA')} ر.س
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      فعلي: {account.budget.actual.toLocaleString('ar-SA')} ر.س
                    </Typography>
                  </Box>
                )}
                <Tooltip title="إضافة/تعديل الموازنة">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedAccount(account)
                      setBudgetData({
                        estimated: account.budget?.estimated || 0,
                        actual: account.budget?.actual || 0,
                        notes: ''
                      })
                      setBudgetDialog(true)
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        }
      >
        {hasChildren && account.children?.map(renderAccountTree)}
      </TreeItem>
    )
  }

  const handleSaveBudget = () => {
    if (!selectedAccount) return

    // Here you would save the budget data to the backend
    console.log('Saving budget for account:', selectedAccount.id, budgetData)
    
    // Update local state
    const updateAccountBudget = (accounts: Account[]): Account[] => {
      return accounts.map(account => {
        if (account.id === selectedAccount.id) {
          return {
            ...account,
            budget: {
              estimated: budgetData.estimated,
              actual: budgetData.actual
            }
          }
        }
        if (account.children) {
          return {
            ...account,
            children: updateAccountBudget(account.children)
          }
        }
        return account
      })
    }

    setAccounts(updateAccountBudget(accounts))
    setBudgetDialog(false)
    setSelectedAccount(null)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          إدارة الموازنات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          إدارة الموازنات من خلال شجرة الحسابات - اختر الحساب وأدخل الموازنة
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Accounts Tree */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  شجرة الحسابات
                </Typography>
              </Box>
              
              <TreeView
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                defaultExpanded={['1', '2', '3', '4']}
                sx={{ flexGrow: 1, maxWidth: '100%' }}
              >
                {accounts.map(renderAccountTree)}
              </TreeView>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ملخص الموازنات
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  إجمالي الموازنة المتوقعة
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  330,000 ر.س
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  إجمالي التنفيذ الفعلي
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="secondary">
                  296,000 ر.س
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  نسبة التنفيذ
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h5" fontWeight="bold">
                    89.7%
                  </Typography>
                  <TrendingUp sx={{ color: 'success.main' }} />
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                sx={{ mt: 2 }}
                onClick={() => {
                  // Navigate to add budget page or open dialog
                  console.log('Add new budget')
                }}
              >
                إضافة موازنة جديدة
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Dialog */}
      <Dialog open={budgetDialog} onClose={() => setBudgetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAccount ? `إدارة موازنة ${selectedAccount.name}` : 'إدارة الموازنة'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="المبلغ المتوقع"
                type="number"
                fullWidth
                value={budgetData.estimated}
                onChange={(e) => setBudgetData({
                  ...budgetData,
                  estimated: parseFloat(e.target.value) || 0
                })}
                InputProps={{
                  endAdornment: 'ر.س'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="المبلغ الفعلي"
                type="number"
                fullWidth
                value={budgetData.actual}
                onChange={(e) => setBudgetData({
                  ...budgetData,
                  actual: parseFloat(e.target.value) || 0
                })}
                InputProps={{
                  endAdornment: 'ر.س'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="ملاحظات"
                multiline
                rows={3}
                fullWidth
                value={budgetData.notes}
                onChange={(e) => setBudgetData({
                  ...budgetData,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialog(false)} startIcon={<Cancel />}>
            إلغاء
          </Button>
          <Button onClick={handleSaveBudget} variant="contained" startIcon={<Save />}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
