'use client'

import React from 'react'
import { TextField, TextFieldProps } from '@mui/material'

interface ArabicTextFieldProps extends Omit<TextFieldProps, 'inputProps'> {
  arabic?: boolean
  labelOffset?: number // إزاحة إضافية للمسميات
}

export default function ArabicTextField({ arabic = true, labelOffset = 20, ...props }: ArabicTextFieldProps) {
  const inputProps = arabic ? {
    dir: 'rtl' as const,
    style: {
      direction: 'rtl' as const,
      textAlign: 'right' as const,
      unicodeBidi: 'bidi-override' as const,
      paddingRight: '12px',
      paddingLeft: '8px',
    }
  } : {
    dir: 'ltr' as const,
    style: {
      direction: 'ltr' as const,
      textAlign: 'left' as const,
      paddingLeft: '12px',
      paddingRight: '8px',
    }
  }

  return (
    <TextField
      {...props}
      inputProps={inputProps}
      sx={{
        ...props.sx,
        '& .MuiInputBase-input': {
          direction: arabic ? 'rtl' : 'ltr',
          textAlign: arabic ? 'right' : 'left',
          unicodeBidi: arabic ? 'bidi-override' : 'normal',
          paddingRight: arabic ? '12px' : '8px',
          paddingLeft: arabic ? '8px' : '12px',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#c4c4c4',
          },
          '&:hover fieldset': {
            borderColor: '#000',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1976d2',
          },
        },
        '& .MuiFormLabel-root': {
          right: arabic ? `${labelOffset}px` : '0px',
          left: arabic ? 'auto' : `${labelOffset}px`,
          transformOrigin: arabic ? 'top right' : 'top left',
          textAlign: arabic ? 'right' : 'left',
          backgroundColor: 'white', // خلفية بيضاء للمسمية
          padding: '0 4px', // حشو داخلي للمسمية
          zIndex: 1, // تأكد من ظهور المسمية فوق الحدود
        },
        '& .MuiFormLabel-root.Mui-focused': {
          right: arabic ? `${labelOffset}px` : '0px',
          left: arabic ? 'auto' : `${labelOffset}px`,
          transformOrigin: arabic ? 'top right' : 'top left',
          backgroundColor: 'white',
          padding: '0 4px',
          zIndex: 1,
        },
        '& .MuiFormLabel-root.MuiFormLabel-filled': {
          right: arabic ? `${labelOffset}px` : '0px',
          left: arabic ? 'auto' : `${labelOffset}px`,
          transformOrigin: arabic ? 'top right' : 'top left',
          backgroundColor: 'white',
          padding: '0 4px',
          zIndex: 1,
        },
      }}
    />
  )
}
