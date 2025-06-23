import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Database, Sparkles, Download, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { QueryMessage } from '@/types'
import { useNaturalLanguageQuery } from '@/hooks/useNaturalLanguageQuery'
import MessageList from './MessageList'
import QueryInput from './QueryInput'
import QuerySuggestions from './QuerySuggestions'
import DataVisualization from '../DataVisualization/DataVisualization'
import { exportService } from '@/services/api'
import toast from 'react-hot-toast'

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<QueryMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { executeQuery, isLoading } = useNaturalLanguageQuery({
    onSuccess: (result) => {
      const assistantMessage: QueryMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: result.analysis?.summary || 'Query executed successfully',
        timestamp: new Date(),
        query: result.data.length > 0 ? 'View SQL' : undefined,
        results: result
      }
      setMessages((prev) => [...prev, assistantMessage])
    },
    onError: (error) => {
      const errorMessage: QueryMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I encountered an error processing your query.',
        timestamp: new Date(),
        error: error.message
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: QueryMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setShowSuggestions(false)

    await executeQuery(inputValue)
  }

  const handleExport = async (message: QueryMessage, format: 'csv' | 'json' | 'excel') => {
    if (!message.results) return

    try {
      const blob = await exportService.exportResults(message.results, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `query-results-${Date.now()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export results')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">Natural Language Database Query</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Powered by AI</span>
            <Sparkles className="w-4 h-4 text-primary-500" />
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Database className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Ask anything about your database
            </h2>
            <p className="text-gray-500 max-w-md">
              Use natural language to query your data. I can help you analyze trends, find insights,
              and generate reports.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <SuggestionCard
                title="User Analytics"
                description="Show me user growth over the last 30 days"
                onClick={() => setInputValue('Show me user growth over the last 30 days')}
              />
              <SuggestionCard
                title="Performance Metrics"
                description="What are my top performing products?"
                onClick={() => setInputValue('What are my top performing products?')}
              />
              <SuggestionCard
                title="Data Health"
                description="Check for any data quality issues"
                onClick={() => setInputValue('Check for any data quality issues')}
              />
              <SuggestionCard
                title="Business Insights"
                description="What interesting patterns can you find?"
                onClick={() => setInputValue('What interesting patterns can you find?')}
              />
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} onExport={handleExport} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <QueryInput
            value={inputValue}
            onChange={setInputValue}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Ask a question about your data..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <AnimatePresence>
          {showSuggestions && inputValue && (
            <QuerySuggestions
              query={inputValue}
              onSelect={(suggestion) => {
                setInputValue(suggestion)
                setShowSuggestions(false)
              }}
              onClose={() => setShowSuggestions(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface SuggestionCardProps {
  title: string
  description: string
  onClick: () => void
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, description, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="p-4 text-left bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
  >
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </motion.button>
)

export default ChatInterface