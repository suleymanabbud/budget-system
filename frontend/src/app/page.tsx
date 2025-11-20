'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress } from '@mui/material'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        setChecking(false)
        return
      }
      
      const token = localStorage.getItem('token')
      
      if (token) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
      setChecking(false)
    }

    // Small delay to ensure localStorage is ready
    setTimeout(checkAuth, 100)
  }, [router])
  
  if (checking) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }
  
  return null
}

