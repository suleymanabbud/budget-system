'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material'
import {
  ExpandMore,
  Search,
  Refresh,
  AccountTree
} from '@mui/icons-material'
import { accountService, Account } from '@/services/accountService'
import { useIsCompanyAdmin, useIsCompanyUser } from '@/hooks/usePermissions'

interface AccountTreeNode extends Account {
  children: AccountTreeNode[]
  expanded?: boolean
}

export default function CompanyAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [treeAccounts, setTreeAccounts] = useState<AccountTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [statistics, setStatistics] = useState<any>(null)
  
  const isCompanyAdmin = useIsCompanyAdmin()
  const isCompanyUser = useIsCompanyUser()

  useEffect(() => {
    if (isCompanyAdmin || isCompanyUser) {
      loadAccounts()
      loadStatistics()
    }
  }, [isCompanyAdmin, isCompanyUser])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const data = await accountService.getAccounts()
      setAccounts(data)
      // Try server tree first (unified to company 1), fallback to local build
      const serverTree = await accountService.getAccountsTree(1)
      const resolvedTree = (Array.isArray(serverTree) && serverTree.length > 0)
        ? serverTree as any
        : buildAccountTree(data as any)
      setTreeAccounts(resolvedTree as any)
    } catch (error) {
      console.error('خطأ في تحميل الحسابات:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await accountService.getAccountStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error)
    }
  }

  const buildAccountTree = (accounts: Account[]): AccountTreeNode[] => {
    const accountMap = new Map<number, AccountTreeNode>()
    const rootAccounts: AccountTreeNode[] = []

    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [], expanded: false })
    })

    accounts.forEach(account => {
      const accountNode = accountMap.get(account.id)!
      
      if (account.parent_id) {
        const parent = accountMap.get(account.parent_id)
        if (parent) {
          parent.children.push(accountNode)
        }
      } else {
        rootAccounts.push(accountNode)
      }
    })

    return rootAccounts
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || account.account_type === filterType
    return matchesSearch && matchesType
  })

  const renderAccountTree = (accounts: AccountTreeNode[], level = 0) => {
    return accounts.map(account => (
      <Box key={account.id} sx={{ ml: level * 2 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 1, 
            borderLeft: `4px solid ${accountService.getAccountTypeColor(account.account_type)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
              {account.code}
            </Typography>
            <Typography variant="body1" fontWeight={level === 0 ? 'bold' : 'normal'}>
              {account.name}
            </Typography>
            <Chip 
              label={accountService.getAccountTypeLabel(account.account_type)}
              size="small"
              sx={{ 
                backgroundColor: accountService.getAccountTypeColor(account.account_type),
                color: 'white'
              }}
            />
            {!account.is_leaf && (
              <Chip label="مجموعة" size="small" color="primary" />
            )}
            {account.is_budgetable && (
              <Chip label="قابل للموازنة" size="small" color="success" />
            )}
          </Box>
        </Paper>
        
        {account.children && account.children.length > 0 && (
          <Box sx={{ ml: 2 }}>
            {renderAccountTree(account.children, level + 1)}
          </Box>
        )}
      </Box>
    ))
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          شجرة الحسابات
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadAccounts}
        >
          تحديث
        </Button>
      </Box>

      {/* Statistics */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {statistics.total_accounts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الحسابات
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {statistics.leaf_accounts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  الحسابات النهائية
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {statistics.budgetable_accounts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  قابلة للموازنة
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {statistics.non_leaf_accounts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  مجموعات الحسابات
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="البحث في الحسابات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>نوع الحساب</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="نوع الحساب"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="asset">أصول</MenuItem>
                <MenuItem value="liability">خصوم</MenuItem>
                <MenuItem value="equity">حقوق الملكية</MenuItem>
                <MenuItem value="revenue">إيرادات</MenuItem>
                <MenuItem value="expense">مصروفات</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Accounts Tree */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            شجرة الحسابات
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info" sx={{ mb: 2 }}>
            إجمالي: {accounts.length} | الجذر في الشجرة: {treeAccounts.length}
          </Alert>
          
          {treeAccounts.length > 0 ? (
            renderAccountTree(treeAccounts)
          ) : (
            <Alert severity="info">
              لا توجد حسابات متاحة
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Flat Accounts Table as fallback/alternative view */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            جدول الحسابات
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {filteredAccounts.length > 0 ? (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead" sx={{ backgroundColor: 'white' }}>
                  <Box component="tr" sx={{ borderBottom: '2px solid #708472' }}>
                    <Box component="th" sx={{ py: 1.5, textAlign: 'center' }}>رقم الحساب</Box>
                    <Box component="th" sx={{ py: 1.5, textAlign: 'center' }}>اسم الحساب</Box>
                    <Box component="th" sx={{ py: 1.5, textAlign: 'center' }}>المستوى</Box>
                    <Box component="th" sx={{ py: 1.5, textAlign: 'center' }}>الحساب الأب</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {filteredAccounts.map((acc) => (
                    <Box component="tr" key={acc.id} sx={{ borderBottom: '1px solid #eee' }}>
                      <Box component="td" sx={{ py: 1, textAlign: 'center' }}>{acc.code}</Box>
                      <Box component="td" sx={{ py: 1, textAlign: 'right' }}>{acc.name}</Box>
                      <Box component="td" sx={{ py: 1, textAlign: 'center' }}>{acc.level}</Box>
                      <Box component="td" sx={{ py: 1, textAlign: 'center' }}>{acc.parent_id ?? '-'}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          ) : (
            <Alert severity="info">لا توجد حسابات مطابقة للفلاتر</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
