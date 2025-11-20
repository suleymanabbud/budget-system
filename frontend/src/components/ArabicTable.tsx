'use client'

import React from 'react'
import { 
  Table, 
  TableProps, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableContainer,
  Paper 
} from '@mui/material'

interface ArabicTableProps extends TableProps {
  arabic?: boolean
  headers: string[]
  rows: any[][]
}

export default function ArabicTable({ 
  arabic = true, 
  headers, 
  rows, 
  ...props 
}: ArabicTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table {...props}>
        <TableHead>
          <TableRow sx={{ backgroundColor: arabic ? '#708472' : '#1976d2' }}>
            {headers.map((header, index) => (
              <TableCell 
                key={index}
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem',
                  direction: arabic ? 'rtl' : 'ltr',
                  textAlign: arabic ? 'right' : 'left',
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell 
                  key={cellIndex}
                  sx={{
                    direction: arabic ? 'rtl' : 'ltr',
                    textAlign: arabic ? 'right' : 'left',
                  }}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

