'use client'
import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Collapse,
  Alert,
  Fade,
  CardContent,
  Snackbar,
} from '@mui/material'
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import { login as loginThunk } from '@/store/slices/authSlice'
import { toast } from 'react-toastify'
import logoImage from '../../../img/ar.jpg'

const LoginPage = () => {
  const router = useRouter()
  // Splash is client-only to avoid SSR hydration mismatches
  const [showSplash, setShowSplash] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false })
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error')
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Decide splash visibility only on client after mount
    try {
      const hasSeen = typeof window !== 'undefined' ? sessionStorage.getItem('hasSeenSplash') : 'true'
      if (!hasSeen) {
        setShowSplash(true)
        const t = setTimeout(() => {
          setShowSplash(false)
          try { sessionStorage.setItem('hasSeenSplash', 'true') } catch {}
        }, 2200)
        return () => clearTimeout(t)
      } else {
        setShowSplash(false)
      }
    } catch {
      setShowSplash(false)
    }
  }, [])

  const validateForm = useCallback(() => {
    const errs = {
      username: !formData.username.trim(),
      password: !formData.password.trim(),
    }
    setFieldErrors(errs)
    return !errs.username && !errs.password
  }, [formData])

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name as 'username' | 'password']) {
      setFieldErrors(prev => ({ ...prev, [name]: false }))
    }
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    // Don't reset showSplash here - it causes the splash to show again
    if (!validateForm()) return
    setLoading(true)
    try {
      // Call real backend auth
      const resultAction = await dispatch(loginThunk({ username: formData.username, password: formData.password }))
      if (loginThunk.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user
        setSuccess('تم تسجيل الدخول بنجاح!')
        toast.success('تم تسجيل الدخول بنجاح')
        setSnackbarSeverity('success')
        setSnackbarMessage('تم تسجيل الدخول بنجاح')
        setSnackbarOpen(true)
        
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          const role = (user.role || '').toString().toUpperCase()
          if (role === 'ADMIN') {
            router.push('/dashboard')
          } else if (role === 'COMPANY_ADMIN' || role === 'COMPANY_USER') {
            router.push('/company-home')
          } else {
        router.push('/dashboard')
          }
        }, 1000)
      } else {
        const errMsg = (resultAction.payload as string) || 'اسم المستخدم أو كلمة المرور غير صحيحة.'
        setError(errMsg)
        toast.error(errMsg)
        setSnackbarSeverity('error')
        setSnackbarMessage(errMsg)
        setSnackbarOpen(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        direction: 'rtl',
        bgcolor: '#5a6b5d',
      }}
    >
      {/* Splash Screen - Full Screen Overlay */}
      {showSplash && !error && !loading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: '#ffffff',
            zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            animation: 'slideUp 2.0s ease-in-out 0.4s forwards',
            '@keyframes slideUp': {
              '0%': { transform: 'translateY(0%)' },
              '100%': { transform: 'translateY(-100%)' },
            },
          }}
        >
          <Image
            src={logoImage}
            alt="شعار صرح القابضة"
            width={180}
            height={180}
            priority
            style={{ borderRadius: 24, objectFit: 'cover', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
          />
            </Box>
      )}
        {/* Brand heading above the card */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 48, sm: 72 },
            left: 0,
            right: 0,
            zIndex: 2,
            px: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: 0.5,
                textShadow: '0 4px 18px rgba(0,0,0,0.25)',
                textAlign: 'center',
                mx: 'auto',
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.4rem' },
              }}
            >
              صرح القابضة
            </Typography>
          </Box>
          </Box>

        <Container maxWidth="sm" sx={{ px: 2 }}>
          <Paper
          elevation={20}
            sx={{
            borderRadius: 3,
              overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Box textAlign="center" mb={3}>
              <Typography variant="h4" fontWeight={800}>تسجيل الدخول</Typography>
              </Box>

            <Collapse in={!!error}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            </Collapse>

            <Collapse in={!!success}>
              <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
            </Collapse>

            <form onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                <TextField
                    fullWidth
                  name="username"
                    label="اسم المستخدم"
                    placeholder="أدخل اسم المستخدم"
                    value={formData.username}
                  onChange={handleInputChange}
                  error={fieldErrors.username}
                  helperText={fieldErrors.username ? 'هذا الحقل مطلوب' : ''}
                  inputProps={{ suppressHydrationWarning: true, autoComplete: 'username', dir: 'ltr' }}
                  InputProps={{}}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      '& input': { direction: 'ltr', textAlign: 'left' },
                      },
                    '& .MuiInputLabel-root': {},
                    }}
                    required
                  disabled={loading}
                  />

                <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                  name="password"
                    label="كلمة المرور"
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                  onChange={handleInputChange}
                  error={fieldErrors.password}
                  helperText={fieldErrors.password ? 'هذا الحقل مطلوب' : ''}
                  inputProps={{ suppressHydrationWarning: true, autoComplete: 'current-password', dir: 'ltr' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                        <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="start" disabled={loading} suppressHydrationWarning>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      '& input': { direction: 'ltr', textAlign: 'left' },
                      },
                    '& .MuiInputLabel-root': {},
                    }}
                    required
                  disabled={loading}
                  />

                <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.6, fontSize: 16, borderRadius: 2, textTransform: 'none', fontWeight: 700 }} suppressHydrationWarning>
                    {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                  </Button>
                </Stack>
              </form>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} صرح القابضة - جميع الحقوق محفوظة</Typography>
              </Box>
            </CardContent>
          </Paper>
      </Container>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
    </Box>
  )
}

export default LoginPage
