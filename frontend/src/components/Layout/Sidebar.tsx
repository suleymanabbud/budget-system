'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material'
import {
  Dashboard,
  Business,
  TrendingUp,
  Close,
  People,
  AccountTree,
  AccountBalance,
  CloudUpload,
} from '@mui/icons-material'
import { RootState } from '@/store/store'
import { usePermissions } from '@/hooks/usePermissions'

interface SidebarProps {
  open: boolean
  onToggle?: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ open, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const permissions = usePermissions()

  const menuItems = [
    { text: 'لوحة التحكم', icon: <Dashboard />, path: '/dashboard', permission: 'view_admin_dashboard' },
    { text: 'الرئيسية', icon: <Business />, path: '/company-home', permission: 'view_own_company' },
    { text: 'أنظمة الموازنة', icon: <AccountBalance />, path: '/budget-systems', permission: 'view_own_company' },
    { text: 'إدارة الشركات', icon: <Business />, path: '/companies', permission: 'manage_companies' },
    { text: 'شجرة الحسابات (إدارة)', icon: <AccountTree />, path: '/admin/accounts', permission: 'view_admin_dashboard' },
    { text: 'رفع شجرة الحسابات', icon: <CloudUpload />, path: '/admin/excel-upload', permission: 'view_admin_dashboard' },
    { text: 'إدارة المستخدمين', icon: <People />, path: '/users', permission: 'manage_users' },
  ].filter(item => permissions[item.permission as keyof typeof permissions])

  const drawerWidth = open ? 280 : 80

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      open={open}
      onClose={onMobileClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1D1D1B',
          color: 'white',
          transition: 'width 0.3s',
          overflowX: 'hidden',
          position: 'fixed',
          top: 0,
          height: '100vh',
          zIndex: 1200,
          right: 0,
          left: 'auto',
          // Mobile responsive
          '@media (max-width: 600px)': {
            width: '280px',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          },
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#708472', width: 45, height: 45 }}>
            <TrendingUp />
          </Avatar>
          {open && (
            <Box>
              <Typography variant="h6" fontWeight="bold" noWrap>
                صرح القابضة
              </Typography>
              <Typography variant="caption" noWrap>
                {user?.full_name || 'Sareh Holding'}
              </Typography>
              <Typography variant="caption" noWrap sx={{ display: 'block', color: 'rgba(255,255,255,0.7)' }}>
                {user?.role === 'admin' ? 'مدير النظام' : 
                 user?.role === 'company_admin' ? 'مدير الشركة' :
                 user?.role === 'company_user' ? 'مستخدم الشركة' : 'مشاهد'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Mobile close button */}
        <IconButton
          size="large"
          onClick={onMobileClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            color: 'white',
            p: 1
          }}
        >
          <Close />
        </IconButton>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1 }}>
            <ListItemButton
              onClick={() => router.push(item.path)}
              selected={pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: {
                      textAlign: 'right',
                      fontWeight: pathname === item.path ? 700 : 500,
                    },
                  }}
                />
              )}
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  ml: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

