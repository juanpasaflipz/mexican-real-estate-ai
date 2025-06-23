import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { nlpQueryService } from '@/services/api'
import { QueryResult } from '@/types'
import toast from 'react-hot-toast'

interface UseNaturalLanguageQueryOptions {
  onSuccess?: (result: QueryResult) => void
  onError?: (error: Error) => void
}

export const useNaturalLanguageQuery = (options?: UseNaturalLanguageQueryOptions) => {
  const [history, setHistory] = useState<Array<{ query: string; result: QueryResult }>>([])

  const mutation = useMutation({
    mutationFn: nlpQueryService.executeQuery,
    onSuccess: (data, variables) => {
      setHistory((prev) => [...prev, { query: variables, result: data }])
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to execute query')
      options?.onError?.(error)
    }
  })

  const executeQuery = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        toast.error('Please enter a query')
        return
      }
      return mutation.mutateAsync(query)
    },
    [mutation]
  )

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    executeQuery,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    history,
    clearHistory
  }
}