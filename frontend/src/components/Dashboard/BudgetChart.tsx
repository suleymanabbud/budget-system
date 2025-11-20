'use client'

import { Box } from '@mui/material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface BudgetChartProps {
  data: any
}

export default function BudgetChart({ data }: BudgetChartProps) {
  // Transform data for chart
  const chartData = Object.entries(data || {}).map(([month, values]: [string, any]) => ({
    month: `شهر ${month}`,
    تقريبية: values.estimated || 0,
    فعلية: values.actual || 0,
  }))

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => value.toLocaleString('ar-SA')}
            contentStyle={{ direction: 'rtl' }}
          />
          <Legend />
          <Bar dataKey="تقريبية" fill="#1976d2" />
          <Bar dataKey="فعلية" fill="#dc004e" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

