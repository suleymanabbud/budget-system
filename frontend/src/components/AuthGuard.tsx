'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { Box, CircularProgress } from '@mui/material'
import { getCurrentUser } from '@/store/slices/authSlice'
import { RootState, AppDispatch } from '@/store/store'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setChecking(false)
        return
      }
      
      const token = localStorage.getItem('token')
      const isLoginPage = pathname === '/login'
      
      // إذا لم يكن عنده token ومحاول يدخل صفحة محمية
      if (!token && !isLoginPage && pathname !== '/') {
        router.push('/login')
        setChecking(false)
        return
      }
      
      // إذا عنده token ومحاول يدخل صفحة login
      if (token && isLoginPage) {
        router.push('/dashboard')
        setChecking(false)
        return
      }
      
      // إذا عنده token لكن لم يتم تحميل بيانات المستخدم
      if (token && !user && !isLoginPage) {
        try {
          await dispatch(getCurrentUser())
        } catch (error) {
          // إذا فشل في تحميل بيانات المستخدم، احذف الـ token
          localStorage.removeItem('token')
          router.push('/login')
        }
      }
      
      setChecking(false)
    }

    checkAuth()
  }, [pathname, router, dispatch, user, isAuthenticated])

  if (checking && pathname !== '/login') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}

