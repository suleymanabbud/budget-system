'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  AccountTree,
  Search,
  FilterList,
  Refresh,
  Clear,
  Visibility,
  VisibilityOff,
  ExpandLess,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { accountService, Account, AccountCreate, AccountUpdate } from '@/services/accountService'
import { useIsAdmin } from '@/hooks/usePermissions'

interface AccountTreeNode extends Account {
  children: AccountTreeNode[]
  expanded?: boolean
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [treeAccounts, setTreeAccounts] = useState<AccountTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')
  const [parentAccountFilter, setParentAccountFilter] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<AccountCreate>({
    code: '',
    name: '',
    name_en: '',
    description: '',
    account_type: 'asset',
    parent_id: undefined,
    level: 1,
    is_active: true,
    is_leaf: true,
    is_budgetable: true,
    company_id: 1 // Default company ID for admin
  })
  const [statistics, setStatistics] = useState<any>(null)
  
  const isAdmin = useIsAdmin()

  useEffect(() => {
    if (isAdmin) {
      loadAccounts()
      loadStatistics()
    }
  }, [isAdmin])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (dialogOpen) {
        if (event.key === 'Escape') {
          setDialogOpen(false)
        } else if (event.ctrlKey && event.key === 'Enter') {
          handleSubmit()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dialogOpen])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const data = await accountService.getAccounts(undefined, 1) // company_id = 1 for admin
      const treeData = await accountService.getAccountsTree(1) // company_id = 1 for admin
      setAccounts(data)
      const resolvedTree = (Array.isArray(treeData) && treeData.length > 0)
        ? treeData as any
        : accountService.buildAccountTree(data as any)
      setTreeAccounts(resolvedTree as any)
    } catch (error) {
      console.error('خطأ في تحميل الحسابات:', error)
      toast.error('فشل في تحميل الحسابات')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await accountService.getAccountStatistics()
      console.log('Statistics loaded:', stats)
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

  const isChildOf = (parentId: number, childId: number): boolean => {
    const child = accounts.find(acc => acc.id === childId)
    if (!child) return false
    
    let current = child
    while (current.parent_id) {
      if (current.parent_id === parentId) return true
      current = accounts.find(acc => acc.id === current.parent_id)!
      if (!current) break
    }
    return false
  }

  const generateAccountCode = (parentAccount: Account): string => {
    // الحصول على جميع الحسابات الفرعية للحساب الأب
    const siblings = accounts.filter(acc => acc.parent_id === parentAccount.id)
    
    // استخراج الأرقام من كود الحساب الأب
    const parentCode = parentAccount.code
    const baseCode = parentCode.replace(/[^0-9]/g, '') // استخراج الأرقام فقط
    
    // البحث عن أعلى رقم موجود
    let maxNumber = 0
    siblings.forEach(sibling => {
      const siblingCode = sibling.code.replace(/[^0-9]/g, '')
      if (siblingCode.startsWith(baseCode)) {
        const number = parseInt(siblingCode.substring(baseCode.length)) || 0
        maxNumber = Math.max(maxNumber, number)
      }
    })
    
    // توليد الكود التالي
    const nextNumber = maxNumber + 1
    const newCode = baseCode + nextNumber.toString().padStart(2, '0')
    
    return newCode
  }

  // دالة تصفية الحسابات
  const filterAccounts = (accounts: AccountTreeNode[]): AccountTreeNode[] => {
    return accounts.filter(account => {
      // البحث النصي
      const matchesSearch = !searchTerm || 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (account.name_en && account.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // فلتر القائمة المالية
      const matchesType = !accountTypeFilter || account.financial_statement === accountTypeFilter
      
      // فلتر الحساب الأب
      const matchesParent = !parentAccountFilter || 
                           (parentAccountFilter === 'null' ? account.parent_id === null : account.parent_id?.toString() === parentAccountFilter)
      
      return matchesSearch && matchesType && matchesParent
    }).map(account => ({
      ...account,
      children: filterAccounts(account.children)
    }))
  }

  // تطبيق الفلاتر
  const filteredTreeAccounts = filterAccounts(treeAccounts)

  const handleCreateAccount = () => {
    setFormData({
      code: '',
      name: '',
      name_en: '',
      description: '',
      account_type: 'asset',
      parent_id: undefined,
      level: 1,
      is_active: true,
      is_leaf: true,
      is_budgetable: true,
      company_id: 1 // Default company ID for admin
    })
    setDialogMode('create')
    setDialogOpen(true)
  }

  const validateForm = () => {
    if (!formData.code.trim()) {
      toast.error('كود الحساب مطلوب')
      return false
    }
    if (!formData.name.trim()) {
      toast.error('اسم الحساب مطلوب')
      return false
    }
    if (!formData.account_type) {
      toast.error('نوع الحساب مطلوب')
      return false
    }
    if (!formData.level || formData.level < 1) {
      toast.error('مستوى الحساب يجب أن يكون أكبر من 0')
      return false
    }
    return true
  }

  const handleEditAccount = (account: Account) => {
    setFormData({
      code: account.code,
      name: account.name,
      name_en: account.name_en || '',
      description: account.description || '',
      account_type: account.account_type,
      parent_id: account.parent_id,
      level: account.level,
      is_active: account.is_active,
      is_leaf: account.is_leaf,
      is_budgetable: account.is_budgetable,
      company_id: account.company_id || 1 // Use existing company_id or default to 1
    })
    setSelectedAccount(account)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleDeleteAccount = async (account: Account) => {
    const hasChildren = accounts.some(acc => acc.parent_id === account.id)
    
    // Check if account can be deleted
    if (hasChildren) {
      toast.error('لا يمكن حذف حساب رئيسي له حسابات فرعية. يجب حذف الحسابات الفرعية أولاً')
      return
    }
    
    if (!account.is_leaf) {
      toast.error('لا يمكن حذف حساب غير نهائي. يجب حذف الحسابات الفرعية أولاً')
      return
    }
    
    const confirmMessage = `هل أنت متأكد من حذف الحساب "${account.name}"؟`
    
    if (window.confirm(confirmMessage)) {
      try {
        await accountService.deleteAccount(account.id)
        toast.success('تم حذف الحساب بنجاح')
        loadAccounts()
        loadStatistics()
      } catch (error) {
        console.error('خطأ في حذف الحساب:', error)
        toast.error('فشل في حذف الحساب')
      }
    }
  }

  const handleClearAllAccounts = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الحسابات؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        const result = await accountService.clearAllAccounts()
        toast.success(result.message)
        loadAccounts()
        loadStatistics()
      } catch (error) {
        console.error('خطأ في حذف جميع الحسابات:', error)
        toast.error('فشل في حذف جميع الحسابات')
      }
    }
  }

  const handleClearLeafAccounts = async () => {
    if (window.confirm('هل تريد حذف الحسابات النهائية فقط؟\nسيتم حذف الحسابات التي لا تحتوي على حسابات فرعية.')) {
      try {
        const result = await accountService.clearLeafAccounts()
        toast.success(result.message)
        loadAccounts()
        loadStatistics()
      } catch (error) {
        console.error('خطأ في حذف الحسابات النهائية:', error)
        toast.error('فشل في حذف الحسابات النهائية')
      }
    }
  }

  const handleUpdateLeafStatus = async () => {
    try {
      const result = await accountService.updateLeafStatus()
      toast.success(result.message)
      loadAccounts()
      loadStatistics()
    } catch (error) {
      console.error('خطأ في تحديث الحالات:', error)
      toast.error('فشل في تحديث الحالات')
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      if (dialogMode === 'create') {
        await accountService.createAccount(formData)
        toast.success('تم إنشاء الحساب بنجاح')
      } else {
        await accountService.updateAccount(selectedAccount!.id, formData)
        toast.success('تم تحديث الحساب بنجاح')
      }
      
      setDialogOpen(false)
      loadAccounts()
      loadStatistics()
    } catch (error) {
      console.error('خطأ في حفظ الحساب:', error)
      toast.error('فشل في حفظ الحساب')
    }
  }

  // الحصول على أنواع الحسابات الفريدة من البيانات (من القائمة المالية)
  const uniqueFinancialStatements = useMemo(() => {
    const statements = new Set<string>()
    accounts.forEach(account => {
      if (account.financial_statement) {
        statements.add(account.financial_statement)
      }
    })
    return Array.from(statements).sort()
  }, [accounts])

  // الحصول على الحسابات الرئيسية للفلترة
  const mainAccounts = useMemo(() => {
    return accounts.filter(account => account.parent_id === null || account.level === 1)
  }, [accounts])

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !accountTypeFilter || account.financial_statement === accountTypeFilter
    const matchesParent = !parentAccountFilter || 
                         (parentAccountFilter === 'null' ? account.parent_id === null : account.parent_id?.toString() === parentAccountFilter)
    return matchesSearch && matchesType && matchesParent
  })

  const toggleNode = (accountId: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedNodes(newExpanded)
  }

  // دالة محلية لتحويل نوع الحساب
  const getAccountTypeLabel = (accountType: string): string => {
    const typeMap: { [key: string]: string } = {
      'ASSET': 'أصول',
      'LIABILITY': 'خصوم',
      'EQUITY': 'حقوق الملكية',
      'REVENUE': 'إيرادات',
      'EXPENSE': 'مصروفات'
    }
    return typeMap[accountType] || accountType
  }

  const getAccountTypeColor = (accountType: string): string => {
    const colorMap: { [key: string]: string } = {
      'ASSET': '#4caf50',
      'LIABILITY': '#f44336',
      'EQUITY': '#2196f3',
      'REVENUE': '#ff9800',
      'EXPENSE': '#9c27b0'
    }
    return colorMap[accountType] || '#757575'
  }

  const renderAccountTable = (accounts: AccountTreeNode[]): JSX.Element[] => {
    const rows: JSX.Element[] = []
    
    
    // إنشاء قائمة مسطحة لجميع الحسابات للبحث
    const allAccountsFlat: AccountTreeNode[] = []
    const flattenAllAccounts = (accounts: AccountTreeNode[]) => {
      accounts.forEach(account => {
        allAccountsFlat.push(account)
        if (account.children && account.children.length > 0) {
          flattenAllAccounts(account.children)
        }
      })
    }
    flattenAllAccounts(accounts)
    
    // إضافة جميع الحسابات من accounts أيضاً
    accounts.forEach(account => {
      if (!allAccountsFlat.find(acc => acc.id === account.id)) {
        allAccountsFlat.push(account)
      }
    })
    
    // إضافة جميع الحسابات من treeAccounts أيضاً
    const flattenTreeAccounts = (accounts: AccountTreeNode[]) => {
      accounts.forEach(account => {
        if (!allAccountsFlat.find(acc => acc.id === account.id)) {
          allAccountsFlat.push(account)
        }
        if (account.children && account.children.length > 0) {
          flattenTreeAccounts(account.children)
        }
      })
    }
    flattenTreeAccounts(treeAccounts)
    
    
    
    const flattenAccounts = (accounts: AccountTreeNode[], level = 0) => {
      accounts.forEach((account, index) => {
        // إضافة الحساب الحالي مع مفتاح فريد
        const uniqueKey = `${account.id}-${account.code}-${level}-${index}-${Date.now()}`
        const isMainAccount = level === 0
        const isSubAccount = level === 1
        const isLeafAccount = level >= 2
        
        rows.push(
          <TableRow 
            key={uniqueKey} 
            hover
            sx={{
              backgroundColor: isMainAccount ? '#f5f7f6' : isSubAccount ? '#fafbfa' : 'white',
              borderLeft: isMainAccount ? '4px solid #708472' : isSubAccount ? '4px solid #A3B1A4' : '4px solid #C8C8C8',
              '&:hover': {
                backgroundColor: isMainAccount ? '#edf1ee' : isSubAccount ? '#f5f7f6' : '#fafbfa',
              }
            }}
          >
            <TableCell sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                fontWeight={isMainAccount ? 'bold' : isSubAccount ? 'medium' : 'normal'}
                sx={{ 
                  fontSize: isMainAccount ? '0.95rem' : isSubAccount ? '0.875rem' : '0.875rem',
                  color: isMainAccount ? '#708472' : 'text.primary'
                }}
              >
                {account.code}
              </Typography>
            </TableCell>
            <TableCell sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: level * 3 }}>
                {level > 0 && (
                  <Box 
                    sx={{ 
                      width: 2, 
                      height: 20, 
                      backgroundColor: isSubAccount ? '#A3B1A4' : '#C8C8C8',
                      mr: 1 
                    }} 
                  />
                )}
                <Typography 
                  variant="body2" 
                  fontWeight={isMainAccount ? 'bold' : isSubAccount ? 'medium' : 'normal'}
                  sx={{ 
                    fontSize: isMainAccount ? '0.95rem' : isSubAccount ? '0.875rem' : '0.875rem',
                    color: isMainAccount ? '#708472' : isSubAccount ? '#3D3935' : '#898A8D'
                  }}
                >
                  {account.name}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: isMainAccount ? '#708472' : isSubAccount ? '#A3B1A4' : '#C8C8C8',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                {account.level}
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: `${getAccountTypeColor(account.account_type)}15`,
                  border: `1px solid ${getAccountTypeColor(account.account_type)}`,
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: getAccountTypeColor(account.account_type),
                    fontWeight: 'medium',
                    fontSize: '0.875rem'
                  }}
                >
                  {account.financial_statement || getAccountTypeLabel(account.account_type)}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
              {account.parent_id ? (
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}
                >
                  {allAccountsFlat.find(acc => acc.id === account.parent_id)?.name || `ID: ${account.parent_id}`}
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: '#f0f4f1',
                    border: '1px solid #708472',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#708472',
                      fontSize: '0.875rem'
                    }}
                  >
                    حساب رئيسي
                  </Typography>
                </Box>
              )}
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Tooltip title="تعديل">
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditAccount(account)}
                    sx={{
                      color: '#708472',
                      '&:hover': {
                        backgroundColor: '#f0f4f1'
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="حذف">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteAccount(account)}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': {
                        backgroundColor: '#ffebee'
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        )
        
        // إضافة الحسابات الفرعية
        if (account.children && account.children.length > 0) {
          flattenAccounts(account.children, level + 1)
        }
      })
    }
    
    flattenAccounts(accounts)
    
    return rows
  }

  const renderAccountTree = (accounts: AccountTreeNode[], level = 0) => {
    return accounts.map((account, index) => {
      const hasChildren = account.children && account.children.length > 0
      const isExpanded = expandedNodes.has(account.id)
      const uniqueKey = `${account.id}-${account.code}-tree-${level}-${index}-${Date.now()}`
      
      return (
        <Box key={uniqueKey} sx={{ ml: level * 2 }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              mb: 1, 
              borderLeft: `4px solid ${accountService.getAccountTypeColor(account.account_type)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                elevation: 3,
                transform: 'translateY(-1px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={() => toggleNode(account.id)}
                  sx={{ mr: 1 }}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              
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
            
            <Box>
              <Tooltip title="تعديل">
                <IconButton 
                  size="small" 
                  onClick={() => handleEditAccount(account)}
                  color="primary"
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="حذف">
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteAccount(account)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
          
          {hasChildren && isExpanded && (
            <Box sx={{ ml: 2 }}>
              {renderAccountTree(account.children, level + 1)}
            </Box>
          )}
        </Box>
      )
    })
  }

  if (!isAdmin) {
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
          إدارة شجرة الحسابات
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="info"
            startIcon={<Refresh />}
            onClick={handleUpdateLeafStatus}
          >
            تحديث الحالات
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateAccount}
          >
            إضافة حساب جديد
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #708472 0%, #5a6b5e 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(112, 132, 114, 0.3)'
                }
              }}
            >
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  إجمالي الحسابات
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {statistics?.total_accounts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #A3B1A4 0%, #8d9e8e 100%)',
                color: '#1D1D1B',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(163, 177, 164, 0.3)'
                }
              }}
            >
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  الحسابات النهائية
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {statistics?.leaf_accounts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #3D3935 0%, #2a2723 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(61, 57, 53, 0.3)'
                }
              }}
            >
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  قابلة للموازنة
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {statistics?.budgetable_accounts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #898A8D 0%, #73747a 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(137, 138, 141, 0.3)'
                }
              }}
            >
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  مجموعات الحسابات
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {statistics?.non_leaf_accounts || 0}
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
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>القائمة المالية</InputLabel>
              <Select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value)}
                label="القائمة المالية"
              >
                <MenuItem value="">الكل</MenuItem>
                {uniqueFinancialStatements.map(statement => (
                  <MenuItem key={statement} value={statement}>
                    {statement}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>الحساب الأب</InputLabel>
              <Select
                value={parentAccountFilter}
                onChange={(e) => setParentAccountFilter(e.target.value)}
                label="الحساب الأب"
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="null">حسابات رئيسية فقط</MenuItem>
                {mainAccounts.map(account => (
                  <MenuItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadAccounts}
            >
              تحديث
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Accounts Tree */}
        {/* Accounts Table */}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              جدول الحسابات (واجهة Excel)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {filteredTreeAccounts.length > 0 ? (
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'white' }}>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1D1D1B', 
                textAlign: 'center',
                fontSize: '0.95rem',
                py: 2,
                borderBottom: '2px solid #708472'
              }}
            >
              رقم الحساب
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1D1D1B', 
                textAlign: 'center',
                fontSize: '0.95rem',
                py: 2,
                borderBottom: '2px solid #708472'
              }}
            >
              اسم الحساب
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1D1D1B', 
                textAlign: 'center',
                fontSize: '0.95rem',
                py: 2,
                borderBottom: '2px solid #708472'
              }}
            >
              المستوى
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1D1D1B', 
                textAlign: 'center',
                fontSize: '0.95rem',
                py: 2,
                borderBottom: '2px solid #708472'
              }}
            >
              القائمة المالية
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1D1D1B', 
                textAlign: 'center',
                fontSize: '0.95rem',
                py: 2,
                borderBottom: '2px solid #708472'
              }}
            >
              الحساب الأب
            </TableCell>
            <TableCell 
              sx={{ 
                fontWeight: 'bold', 
                color: '#1D1D1B', 
                textAlign: 'center',
                fontSize: '0.95rem',
                py: 2,
                borderBottom: '2px solid #708472'
              }}
            >
              الإجراءات
            </TableCell>
          </TableRow>
        </TableHead>
                    <TableBody>
                      {renderAccountTable(filteredTreeAccounts)}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ) : (
              <Alert severity="info">
                لا توجد حسابات تطابق الفلاتر المحددة
              </Alert>
            )}
          </CardContent>
        </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 2, fontSize: '1.5rem', fontWeight: 'bold' }}>
          {dialogMode === 'create' ? 'إضافة حساب جديد' : 'تعديل الحساب'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* الصف الأول - المعلومات الأساسية */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  المعلومات الأساسية
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="كود الحساب"
                  placeholder="مثال: 1000"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 سيتم توليد الكود تلقائياً عند اختيار الحساب الأب
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="اسم الحساب"
                  placeholder="مثال: الأصول"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="اسم الحساب بالإنجليزية"
                  placeholder="مثال: Assets"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="وصف الحساب"
                  placeholder="وصف مختصر للحساب..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>

              {/* الصف الثاني - التصنيف والهيكل */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  التصنيف والهيكل
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع الحساب</InputLabel>
                  <Select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                    label="نوع الحساب"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="asset">أصول (Assets) - ما تملكه الشركة</MenuItem>
                    <MenuItem value="liability">خصوم (Liabilities) - ما تدين به الشركة</MenuItem>
                    <MenuItem value="equity">حقوق الملكية (Equity) - رأس المال والأرباح</MenuItem>
                    <MenuItem value="revenue">إيرادات (Revenue) - دخل الشركة</MenuItem>
                    <MenuItem value="expense">مصروفات (Expenses) - تكاليف الشركة</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 اختر نوع الحساب المناسب لطبيعة الحساب
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="مستوى الحساب"
                  type="number"
                  placeholder="1, 2, 3..."
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                  required
                  fullWidth
                  inputProps={{ min: 1, max: 10 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 المستوى 1 للحسابات الرئيسية، 2 للحسابات الفرعية، وهكذا
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>الحساب الأب (اختياري)</InputLabel>
                  <Select
                    value={formData.parent_id ?? ''}
                    onChange={(e) => {
                      const parentId = e.target.value ? parseInt(String(e.target.value)) : undefined
                      const parentAccount = parentId ? accounts.find(acc => acc.id === parentId) : null
                      const newLevel = parentAccount ? parentAccount.level + 1 : 1
                      
                      // توليد كود الحساب تلقائياً إذا كان هناك حساب أب
                      let newCode = formData.code
                      if (parentAccount) {
                        newCode = generateAccountCode(parentAccount)
                      }
                      
                      setFormData({ 
                        ...formData, 
                        parent_id: parentId,
                        level: newLevel,
                        code: newCode
                      })
                      
                      // إذا كان هناك حساب أب، يجب أن نغير is_leaf للأب إلى false
                      if (parentAccount && parentAccount.is_leaf) {
                        // تحديث الحساب الأب في القائمة المحلية
                        const updatedAccounts = accounts.map(acc => 
                          acc.id === parentId ? { ...acc, is_leaf: false } : acc
                        )
                        setAccounts(updatedAccounts)
                      }
                    }}
                    label="الحساب الأب (اختياري)"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">بدون حساب أب</MenuItem>
                    {accounts
                      .filter(account => {
                        // لا يمكن أن يكون الحساب أباً لنفسه
                        if (account.id === selectedAccount?.id) return false
                        // لا يمكن أن يكون الحساب أباً لأحد أبنائه
                        if (selectedAccount && isChildOf(account.id, selectedAccount.id)) return false
                        // عند إنشاء حساب جديد، نعرض جميع الحسابات
                        // عند التعديل، نعرض فقط الحسابات غير النهائية
                        if (dialogMode === 'create') {
                          return true // عرض جميع الحسابات عند الإنشاء
                        } else {
                          return !account.is_leaf // فقط الحسابات غير النهائية عند التعديل
                        }
                      })
                      .map(account => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.code} - {account.name} (مستوى {account.level})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 اختر حساب أب لإنشاء حساب فرعي، أو اتركه فارغاً لإنشاء حساب رئيسي
                </Typography>
              </Grid>

              {/* الصف الثالث - الإعدادات */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  الإعدادات
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>قابل للموازنة</InputLabel>
                  <Select
                    value={formData.is_budgetable ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_budgetable: e.target.value === 'true' })}
                    label="قابل للموازنة"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="true">نعم - يمكن إضافة موازنة لهذا الحساب</MenuItem>
                    <MenuItem value="false">لا - حساب تجميعي فقط</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 الحسابات القابلة للموازنة يمكن إضافة مبالغ موازنة لها
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>نشط</InputLabel>
                  <Select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    label="نشط"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="true">نعم - الحساب نشط ومتاح للاستخدام</MenuItem>
                    <MenuItem value="false">لا - الحساب معطل</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 الحسابات المعطلة لا تظهر في القوائم العادية
                </Typography>
              </Grid>

              {/* معاينة الحساب */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 2 }}>
                  معاينة الحساب
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      الكود:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formData.code || 'غير محدد'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      الاسم:
                    </Typography>
                    <Typography variant="body1">
                      {formData.name || 'غير محدد'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      النوع:
                    </Typography>
                    <Typography variant="body1">
                      {formData.account_type === 'asset' ? 'أصول' :
                       formData.account_type === 'liability' ? 'خصوم' :
                       formData.account_type === 'equity' ? 'حقوق الملكية' :
                       formData.account_type === 'revenue' ? 'إيرادات' :
                       formData.account_type === 'expense' ? 'مصروفات' : 'غير محدد'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      المستوى:
                    </Typography>
                    <Typography variant="body1">
                      {formData.level}
                    </Typography>
                  </Box>
                  {formData.parent_id && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        الحساب الأب:
                      </Typography>
                      <Typography variant="body1">
                        {accounts.find(acc => acc.id === formData.parent_id)?.name || 'غير محدد'}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            size="large"
            sx={{ borderRadius: 2 }}
          >
            إلغاء (Esc)
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            size="large"
            sx={{ borderRadius: 2 }}
          >
            {dialogMode === 'create' ? 'إنشاء الحساب (Ctrl+Enter)' : 'تحديث الحساب (Ctrl+Enter)'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
