import axios from 'axios'
import { QueryResult, DatabaseSchema, SavedQuery } from '@/types'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'https://mexican-real-estate-ai.onrender.com/api' || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const nlpQueryService = {
  // Execute natural language query
  executeQuery: async (query: string): Promise<QueryResult> => {
    const response = await api.post('/nlp/query', { query })
    return response.data
  },

  // Get query suggestions based on partial input
  getSuggestions: async (partialQuery: string): Promise<string[]> => {
    const response = await api.get('/nlp/suggestions', {
      params: { q: partialQuery }
    })
    return response.data
  },

  // Get query templates
  getTemplates: async (category?: string): Promise<SavedQuery[]> => {
    const response = await api.get('/nlp/templates', {
      params: { category }
    })
    return response.data
  }
}

export const databaseService = {
  // Get database schema
  getSchema: async (): Promise<DatabaseSchema> => {
    const response = await api.get('/database/schema')
    return response.data
  },

  // Get table preview
  getTablePreview: async (tableName: string, limit = 10): Promise<QueryResult> => {
    const response = await api.get(`/database/tables/${tableName}/preview`, {
      params: { limit }
    })
    return response.data
  },

  // Get database statistics
  getStats: async (): Promise<any> => {
    const response = await api.get('/database/stats')
    return response.data
  }
}

export const queryService = {
  // Save query
  saveQuery: async (query: Omit<SavedQuery, 'id' | 'createdAt'>): Promise<SavedQuery> => {
    const response = await api.post('/queries', query)
    return response.data
  },

  // Get saved queries
  getSavedQueries: async (): Promise<SavedQuery[]> => {
    const response = await api.get('/queries')
    return response.data
  },

  // Delete saved query
  deleteQuery: async (id: string): Promise<void> => {
    await api.delete(`/queries/${id}`)
  },

  // Update query
  updateQuery: async (id: string, updates: Partial<SavedQuery>): Promise<SavedQuery> => {
    const response = await api.patch(`/queries/${id}`, updates)
    return response.data
  }
}

export const exportService = {
  // Export query results
  exportResults: async (
    results: QueryResult,
    format: 'csv' | 'json' | 'excel',
    options?: any
  ): Promise<Blob> => {
    const response = await api.post(
      '/export',
      { results, format, options },
      { responseType: 'blob' }
    )
    return response.data
  }
}

export default api