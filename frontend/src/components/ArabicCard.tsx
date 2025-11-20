'use client'

import React from 'react'
import { Card, CardProps, CardContent } from '@mui/material'

interface ArabicCardProps extends CardProps {
  arabic?: boolean
}

export default function ArabicCard({ arabic = true, children, ...props }: ArabicCardProps) {
  return (
    <Card
      {...props}
      sx={{
        ...props.sx,
        direction: arabic ? 'rtl' : 'ltr',
        textAlign: arabic ? 'right' : 'left',
      }}
    >
      <CardContent sx={{
        direction: arabic ? 'rtl' : 'ltr',
        textAlign: arabic ? 'right' : 'left',
      }}>
        {children}
      </CardContent>
    </Card>
  )
}

