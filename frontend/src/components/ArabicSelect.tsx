'use client'

import React from 'react'
import { Select, SelectProps, MenuItem, FormControl, InputLabel } from '@mui/material'

interface ArabicSelectProps extends Omit<SelectProps, 'inputProps'> {
  arabic?: boolean
  options: { value: string | number; label: string }[]
}

export default function ArabicSelect({ arabic = true, options, ...props }: ArabicSelectProps) {
  return (
    <FormControl fullWidth>
      <InputLabel sx={{ 
        right: 0,
        left: 'auto',
        transformOrigin: 'top right',
        textAlign: 'right',
      }}>
        {props.label}
      </InputLabel>
      <Select
        {...props}
        sx={{
          ...props.sx,
          direction: arabic ? 'rtl' : 'ltr',
          textAlign: arabic ? 'right' : 'left',
          '& .MuiSelect-select': {
            direction: arabic ? 'rtl' : 'ltr',
            textAlign: arabic ? 'right' : 'left',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem 
            key={option.value} 
            value={option.value}
            sx={{
              direction: arabic ? 'rtl' : 'ltr',
              textAlign: arabic ? 'right' : 'left',
              justifyContent: arabic ? 'flex-end' : 'flex-start',
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

