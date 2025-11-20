'use client'

import { Box } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface ComparisonChartProps {
  data: any
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
  // Transform data for chart
  const chartData = Object.entries(data || {}).map(([month, values]: [string, any]) => ({
    month: `${month}`,
    estimated: values.estimated || 0,
    actual: values.actual || 0,
    variance: values.variance || 0,
  }))

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => value.toLocaleString('ar-SA')}
            contentStyle={{ direction: 'rtl' }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="estimated"
            stackId="1"
            stroke="#1976d2"
            fill="#1976d2"
            name="التقريبية"
          />
          <Area
            type="monotone"
            dataKey="actual"
            stackId="2"
            stroke="#dc004e"
            fill="#dc004e"
            name="الفعلية"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

