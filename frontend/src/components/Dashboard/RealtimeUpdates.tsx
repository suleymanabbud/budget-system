'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Divider,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  FiberManualRecord,
} from '@mui/icons-material'
import { io, Socket } from 'socket.io-client'

interface Update {
  id: string
  type: string
  message: string
  timestamp: Date
  change: number
}

export default function RealtimeUpdates() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:8000', {
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to WebSocket')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from WebSocket')
    })

    newSocket.on('budget_update', (data: any) => {
      const newUpdate: Update = {
        id: Date.now().toString(),
        type: data.type || 'update',
        message: data.message || 'تحديث جديد',
        timestamp: new Date(),
        change: data.change || 0,
      }
      
      setUpdates((prev) => [newUpdate, ...prev].slice(0, 10))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FiberManualRecord
          sx={{
            fontSize: 12,
            color: isConnected ? 'success.main' : 'error.main',
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {isConnected ? 'متصل' : 'غير متصل'}
        </Typography>
      </Box>

      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {updates.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Refresh sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              لا توجد تحديثات حالياً
            </Typography>
          </Box>
        ) : (
          updates.map((update, index) => (
            <Box key={update.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  {update.change >= 0 ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={update.message}
                  secondary={
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(update.timestamp)}
                      </Typography>
                      {update.change !== 0 && (
                        <Chip
                          label={`${update.change > 0 ? '+' : ''}${update.change.toLocaleString('ar-SA')}`}
                          size="small"
                          color={update.change >= 0 ? 'success' : 'error'}
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < updates.length - 1 && <Divider variant="inset" />}
            </Box>
          ))
        )}
      </List>
    </Box>
  )
}

