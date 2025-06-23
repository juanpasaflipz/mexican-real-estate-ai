import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Clock, Star } from 'lucide-react'
import { nlpQueryService } from '@/services/api'
import clsx from 'clsx'

interface QuerySuggestionsProps {
  query: string
  onSelect: (suggestion: string) => void
  onClose: () => void
}

const QuerySuggestions: React.FC<QuerySuggestionsProps> = ({ query, onSelect, onClose }) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const results = await nlpQueryService.getSuggestions(query)
        setSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Static suggestions based on common patterns
  const staticSuggestions = [
    {
      icon: TrendingUp,
      text: 'Show me growth trends',
      category: 'Analytics'
    },
    {
      icon: Clock,
      text: 'Recent activity in the last 24 hours',
      category: 'Time-based'
    },
    {
      icon: Star,
      text: 'Top performing items',
      category: 'Rankings'
    }
  ]

  const filteredStaticSuggestions = staticSuggestions.filter(s =>
    s.text.toLowerCase().includes(query.toLowerCase())
  )

  if (!loading && suggestions.length === 0 && filteredStaticSuggestions.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
    >
      {loading ? (
        <div className="p-4 text-center text-sm text-gray-500">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            Finding suggestions...
          </div>
        </div>
      ) : (
        <>
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {filteredStaticSuggestions.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">Try these</div>
              {filteredStaticSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={index}
                    onClick={() => onSelect(suggestion.text)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        {suggestion.text}
                      </div>
                      <span className="text-xs text-gray-400">{suggestion.category}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

export default QuerySuggestions