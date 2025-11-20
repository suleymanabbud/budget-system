'use client'

import { Box, Backdrop } from '@mui/material'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import AuthGuard from '@/components/AuthGuard'
import { useState } from 'react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <AuthGuard>
      <Box className="main-layout">
        {/* Mobile backdrop */}
        <Backdrop
          sx={{
            display: { xs: 'block', sm: 'none' },
            zIndex: 1100
          }}
          open={mobileOpen}
          onClick={() => setMobileOpen(false)}
        />

        <Box
          className="sidebar-container"
          data-open={mobileOpen}
        >
          <Sidebar
            open={sidebarOpen}
            onToggle={handleDrawerToggle}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        </Box>
        <Box
          component="main"
          className="main-content"
          sx={{
            p: { xs: 2, sm: 2.5 },
            mr: {
              xs: 0,
              sm: sidebarOpen ? '280px' : '80px'
            },
            ml: { xs: 0, sm: 0 },
            transition: 'margin-right 0.3s ease',
            backgroundColor: '#fafafa',
            minHeight: '100vh',
            width: {
              xs: '100%',
              sm: sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 80px)'
            },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Header onMenuClick={handleMobileDrawerToggle} />
          {children}
        </Box>
      </Box>
    </AuthGuard>
  )
}

