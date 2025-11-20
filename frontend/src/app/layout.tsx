'use client'

import { Inter, Cairo, Playfair_Display } from 'next/font/google'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { CacheProvider } from '@emotion/react'
import { rtlCache } from './emotion-cache'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { store } from '@/store/store'
import { sarehTheme } from './theme'
import './globals.css'
// import './fonts.css'

const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-cairo',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400','500','600','700','800','900']
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable} ${playfair.variable}`}>
      <head>
        <title>صرح القابضة - نظام إدارة الموازنات</title>
        <meta name="description" content="نظام إدارة الموازنات - صرح القابضة" />
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body suppressHydrationWarning>
        <Provider store={store}>
          <CacheProvider value={rtlCache}>
            <ThemeProvider theme={sarehTheme}>
              <CssBaseline />
              {children}
              <ToastContainer
                position="top-left"
                autoClose={3000}
                rtl={true}
                theme="colored"
              />
            </ThemeProvider>
          </CacheProvider>
        </Provider>
      </body>
    </html>
  )
}

