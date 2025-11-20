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
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  Business,
  Add,
  Edit,
  Save,
  Cancel,
  Visibility
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { accountService, Account } from '@/services/accountService'
import { useIsCompanyAdmin, useIsCompanyUser } from '@/hooks/usePermissions'

interface BudgetForm {
  account_id: number
  amount: number
  period: string
  notes?: string
}

export default function BudgetSystemsPage() {
  const [commercialAccounts, setCommercialAccounts] = useState<Account[]>([])
  const [investmentAccounts, setInvestmentAccounts] = useState<Account[]>([])
  const [allAccounts, setAllAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'commercial' | 'investment' | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [budgetForm, setBudgetForm] = useState<BudgetForm>({
    account_id: 0,
    amount: 0,
    period: '',
    notes: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedRootId, setSelectedRootId] = useState<number | ''>('')
  const [rootOptions, setRootOptions] = useState<Account[]>([])
  
  const isCompanyAdmin = useIsCompanyAdmin()
  const isCompanyUser = useIsCompanyUser()

  useEffect(() => {
    if (isCompanyAdmin || isCompanyUser) {
      // تأخير بسيط للتأكد من تحميل بيانات المستخدم
      setTimeout(() => {
        loadAccounts()
      }, 100)
    }
  }, [isCompanyAdmin, isCompanyUser])

         const loadAccounts = async () => {
           try {
             setLoading(true)

             // التحقق من وجود token
             const token = localStorage.getItem('token')
             if (!token) {
               console.error('لا يوجد token')
               toast.error('يرجى تسجيل الدخول مرة أخرى')
               return
             }

             console.log('محاولة تحميل الحسابات...')
            const accounts = await accountService.getAccounts()
            console.log('تم تحميل الحسابات:', accounts)
            setAllAccounts(accounts)

            // تحديد حسابات الأب (المستوى 1 أو بدون أب) وأخذ الثمانية الأساسية
            const roots = accounts
              .filter(a => !a.parent_id || a.level === 1)
              .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'))
              .slice(0, 8)
            setRootOptions(roots)

            // لا نستبعد أي حساب: اعرض جميع الحسابات كما هي
            setCommercialAccounts(accounts)
            setInvestmentAccounts(accounts)
           } catch (error) {
             console.error('خطأ في تحميل الحسابات:', error)
             toast.error('فشل في تحميل الحسابات: ' + (error as Error).message)
           } finally {
             setLoading(false)
           }
         }

  const handleCategorySelect = (category: 'commercial' | 'investment') => {
    setSelectedCategory(category)
  }

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account)
    setBudgetForm({
      account_id: account.id,
      amount: 0,
      period: new Date().getFullYear().toString(),
      notes: ''
    })
    setBudgetDialogOpen(true)
  }

  const handleBudgetSubmit = async () => {
    try {
      // هنا سيتم إرسال البيانات إلى API الموازنات
      console.log('إضافة موازنة:', budgetForm)
      toast.success('تم إضافة الموازنة بنجاح')
      setBudgetDialogOpen(false)
    } catch (error) {
      console.error('خطأ في إضافة الموازنة:', error)
      toast.error('فشل في إضافة الموازنة')
    }
  }

  // اجلب كل التوابع لحساب أب محدد
  const getDescendants = (rootId: number, source: Account[]): Account[] => {
    const byParent = new Map<number, Account[]>()
    source.forEach(a => {
      if (a.parent_id) {
        const arr = byParent.get(a.parent_id) || []
        arr.push(a)
        byParent.set(a.parent_id, arr)
      }
    })
    const result: Account[] = []
    const stack: number[] = [rootId]
    const visited = new Set<number>()
    while (stack.length) {
      const pid = stack.pop()!
      if (visited.has(pid)) continue
      visited.add(pid)
      const children = byParent.get(pid) || []
      for (const child of children) {
        result.push(child)
        stack.push(child.id)
      }
    }
    return result
  }

  const renderAccountTable = (accounts: Account[], title: string) => {
    // تحديد مجموعة العرض: إما جميع الأبناء للحساب الأب المختار
    // أو إن لم توجد علاقات أب/ابن في البيانات (parent_id غير موجودة)، نعرض جميع الحسابات
    const hasAnyChildLinks = allAccounts.some(a => a.parent_id != null && a.parent_id !== undefined)
    const baseList: Account[] = selectedRootId
      ? getDescendants(selectedRootId as number, allAccounts)
      : (hasAnyChildLinks ? accounts.filter(a => a.parent_id != null) : accounts)

    // حصر القائمة ضمن الفئة الحالية (تجاري/استثماري)
    const categoryIds = new Set(accounts.map(a => a.id))
    const scopedList = baseList.filter(a => categoryIds.has(a.id))
    // Filter accounts based on search term and type
    const filteredAccounts = scopedList.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (account.name_en && account.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = filterType === 'all' || 
                         (filterType === 'budgetable' && account.is_budgetable) ||
                         (filterType === 'leaf' && account.is_leaf) ||
                         (filterType === 'active' && account.is_active)
      
      return matchesSearch && matchesType
    })

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
          {title} ({filteredAccounts.length})
        </Typography>
        
        {/* Root selector + Search and Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>اختر حساب أب</InputLabel>
            <Select
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value as number | '')}
              label="اختر حساب أب"
              displayEmpty
            >
              <MenuItem value=""><em>عرض جميع الحسابات الفرعية (بدون الآباء)</em></MenuItem>
              {rootOptions.map(root => (
                <MenuItem key={root.id} value={root.id}>{root.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="البحث في الحسابات"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            inputProps={{ dir: 'rtl' }}
            sx={{ minWidth: 200, '& input': { textAlign: 'right' } }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>فلترة حسب</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="فلترة حسب"
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="budgetable">قابلة للموازنة</MenuItem>
              <MenuItem value="leaf">حسابات نهائية</MenuItem>
              <MenuItem value="active">نشطة</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => {
              // Export to Excel functionality
              const data = filteredAccounts.map(account => ({
                'كود الحساب': account.code,
                'اسم الحساب': account.name,
                'الاسم الإنجليزي': account.name_en || '',
                'النوع': account.financial_statement || accountService.getAccountTypeLabel(account.account_type),
                'المستوى': account.level,
                'قابل للموازنة': account.is_budgetable ? 'نعم' : 'لا',
                'حساب نهائي': account.is_leaf ? 'نعم' : 'لا',
                'نشط': account.is_active ? 'نعم' : 'لا'
              }))
              
              const csvContent = [
                Object.keys(data[0] || {}).join(','),
                ...data.map(row => Object.values(row).join(','))
              ].join('\n')
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
              const link = document.createElement('a')
              const url = URL.createObjectURL(blob)
              link.setAttribute('href', url)
              link.setAttribute('download', `${title}_${new Date().toISOString().split('T')[0]}.csv`)
              link.style.visibility = 'hidden'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            sx={{ ml: 'auto' }}
          >
            تصدير إلى Excel
          </Button>
        </Box>
        
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#708472 !important' }}>
                <TableCell sx={{ 
                  color: 'white !important', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem',
                  backgroundColor: '#708472 !important'
                }}>كود الحساب</TableCell>
                <TableCell sx={{ 
                  color: 'white !important', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem',
                  backgroundColor: '#708472 !important'
                }}>اسم الحساب</TableCell>
                <TableCell sx={{ 
                  color: 'white !important', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem',
                  backgroundColor: '#708472 !important'
                }}>النوع</TableCell>
                <TableCell sx={{ 
                  color: 'white !important', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem',
                  backgroundColor: '#708472 !important'
                }}>المستوى</TableCell>
                <TableCell sx={{ 
                  color: 'white !important', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem',
                  backgroundColor: '#708472 !important'
                }}>الحالة</TableCell>
                <TableCell sx={{ 
                  color: 'white !important', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem',
                  backgroundColor: '#708472 !important'
                }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAccounts.map((account) => (
              <TableRow 
                key={account.id}
                hover
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: '#fafafa'
                  }
                }}
                onClick={() => handleAccountSelect(account)}
              >
                <TableCell sx={{ color: '#333' }}>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {account.code}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: '#333' }}>
                  <Typography variant="body1" fontWeight={account.is_leaf ? 600 : 400} color="#333">
                    {account.name}
                  </Typography>
                  {account.name_en && (
                    <Typography variant="caption" color="#666">
                      {account.name_en}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={account.financial_statement || accountService.getAccountTypeLabel(account.account_type)}
                    size="small"
                    sx={{ 
                      backgroundColor: accountService.getAccountTypeColor(account.account_type),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#333' }}>
                  <Typography variant="body2" color="#333">
                    {account.level}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {account.is_budgetable && (
                      <Chip label="قابل للموازنة" size="small" color="success" variant="outlined" />
                    )}
                    {account.is_leaf && (
                      <Chip label="نهائي" size="small" color="primary" variant="outlined" />
                    )}
                    {account.is_active && (
                      <Chip label="نشط" size="small" color="success" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAccountSelect(account)
                    }}
                    sx={{ minWidth: 100 }}
                  >
                    إضافة موازنة
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {filteredAccounts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm || filterType !== 'all' ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد حسابات في هذه الفئة'}
          </Typography>
        </Box>
      )}
      </Box>
    )
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        أنظمة الموازنة
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        إدارة موازنات الشركات والحسابات المالية
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#708472', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">
              {commercialAccounts.length}
            </Typography>
            <Typography variant="body2">
              الحسابات التجارية
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#A3B1A4', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">
              {investmentAccounts.length}
            </Typography>
            <Typography variant="body2">
              الحسابات الاستثمارية
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#3D3935', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">
              {commercialAccounts.filter(acc => acc.is_budgetable).length}
            </Typography>
            <Typography variant="body2">
              قابلة للموازنة
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#898A8D', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">
              {commercialAccounts.filter(acc => acc.is_leaf).length}
            </Typography>
            <Typography variant="body2">
              حسابات نهائية
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        اختر نوع الحسابات لإدارة الموازنات
      </Typography>

      {/* Category Selection */}
      {!selectedCategory && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleCategorySelect('commercial')}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Business sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  الحسابات التجارية
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  إدارة موازنات العمليات التجارية والإيرادات والمصروفات
                </Typography>
                <Chip 
                  label={`${commercialAccounts.length} حساب`} 
                  color="primary" 
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleCategorySelect('investment')}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <TrendingUp sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  الحسابات الاستثمارية
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  إدارة موازنات الاستثمارات والأصول المالية
                </Typography>
                <Chip 
                  label={`${investmentAccounts.length} حساب`} 
                  color="success" 
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Accounts List */}
      {selectedCategory && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => setSelectedCategory(null)}
              sx={{ mr: 2 }}
            >
              العودة
            </Button>
            <Typography variant="h5" fontWeight="bold">
              {selectedCategory === 'commercial' ? 'الحسابات التجارية' : 'الحسابات الاستثمارية'}
            </Typography>
          </Box>

          {renderAccountTable(
            selectedCategory === 'commercial' ? commercialAccounts : investmentAccounts,
            selectedCategory === 'commercial' ? 'الحسابات التجارية' : 'الحسابات الاستثمارية'
          )}
        </Box>
      )}

      {/* Budget Dialog */}
      <Dialog open={budgetDialogOpen} onClose={() => setBudgetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          إضافة موازنة - {selectedAccount?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="المبلغ"
              type="number"
              value={budgetForm.amount}
              onChange={(e) => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) || 0 })}
              required
              fullWidth
              inputProps={{ dir: 'ltr' }}
              sx={{ '& input': { textAlign: 'left' } }}
            />
            <FormControl fullWidth>
              <InputLabel>الفترة</InputLabel>
              <Select
                value={budgetForm.period}
                onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value })}
                label="الفترة"
              >
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2026">2026</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="ملاحظات"
              value={budgetForm.notes}
              onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
              inputProps={{ dir: 'rtl' }}
              sx={{ '& textarea': { textAlign: 'right' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialogOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleBudgetSubmit} variant="contained">
            إضافة الموازنة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
