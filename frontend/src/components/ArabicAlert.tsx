'use client'

import React from 'react'
import { Alert, AlertProps } from '@mui/material'

interface ArabicAlertProps extends AlertProps {
  arabic?: boolean
}

export default function ArabicAlert({ arabic = true, children, ...props }: ArabicAlertProps) {
  return (
    <Alert
      {...props}
      sx={{
        ...props.sx,
        direction: arabic ? 'rtl' : 'ltr',
        textAlign: arabic ? 'right' : 'left',
        '& .MuiAlert-message': {
          direction: arabic ? 'rtl' : 'ltr',
          textAlign: arabic ? 'right' : 'left',
        },
      }}
    >
      {children}
    </Alert>
  )
}

