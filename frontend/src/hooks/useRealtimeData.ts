import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { QueryResult } from '@/types'

interface RealtimeDataOptions {
  query?: string
  interval?: number
  enabled?: boolean
}

export const useRealtimeData = ({ query, interval = 5000, enabled = true }: RealtimeDataOptions) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [data, setData] = useState<QueryResult | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const newSocket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setError(null)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('error', (err) => {
      setError(err.message)
    })

    newSocket.on('queryResult', (result: QueryResult) => {
      setData(result)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [enabled])

  const subscribe = useCallback(
    (newQuery: string) => {
      if (!socket || !isConnected) return

      socket.emit('subscribe', {
        query: newQuery,
        interval
      })
    },
    [socket, isConnected, interval]
  )

  const unsubscribe = useCallback(() => {
    if (!socket || !isConnected) return
    socket.emit('unsubscribe')
  }, [socket, isConnected])

  useEffect(() => {
    if (query && isConnected) {
      subscribe(query)
    }
    return () => {
      unsubscribe()
    }
  }, [query, isConnected, subscribe, unsubscribe])

  return {
    data,
    isConnected,
    error,
    subscribe,
    unsubscribe
  }
}