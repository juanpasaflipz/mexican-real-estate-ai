import React from 'react'
import { motion } from 'framer-motion'
import { User, Bot, Download, Copy, Check, AlertCircle } from 'lucide-react'
import { QueryMessage } from '@/types'
import DataTable from './DataTable'
import SqlDisplay from './SqlDisplay'
import { format } from 'date-fns'
import clsx from 'clsx'

interface MessageListProps {
  messages: QueryMessage[]
  onExport: (message: QueryMessage, format: 'csv' | 'json' | 'excel') => void
}

const MessageList: React.FC<MessageListProps> = ({ messages, onExport }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={clsx(
            'flex gap-4',
            message.type === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.type === 'assistant' && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          )}

          <div
            className={clsx(
              'max-w-3xl',
              message.type === 'user' ? 'order-1' : 'order-2'
            )}
          >
            <div
              className={clsx(
                'rounded-lg px-4 py-3',
                message.type === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200'
              )}
            >
              <p className={clsx(
                'text-sm',
                message.type === 'user' ? 'text-white' : 'text-gray-800'
              )}>
                {message.content}
              </p>

              {message.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">{message.error}</p>
                  </div>
                </div>
              )}

              {message.results && (
                <div className="mt-4 space-y-4">
                  {/* SQL Query Display */}
                  {message.query && (
                    <SqlDisplay query={message.query} />
                  )}

                  {/* Data Table */}
                  {message.results.data.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">
                            Results ({message.results.rowCount} rows)
                          </h4>
                          <p className="text-xs text-gray-500">
                            Executed in {message.results.executionTime}ms
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onExport(message, 'csv')}
                            className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Download className="w-3 h-3 inline mr-1" />
                            CSV
                          </button>
                          <button
                            onClick={() => onExport(message, 'json')}
                            className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Download className="w-3 h-3 inline mr-1" />
                            JSON
                          </button>
                        </div>
                      </div>
                      <DataTable
                        data={message.results.data}
                        columns={message.results.columns}
                      />
                    </div>
                  )}

                  {/* Insights */}
                  {message.results.analysis?.insights && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Key Insights</h4>
                      <ul className="space-y-1">
                        {message.results.analysis.insights.map((insight, i) => (
                          <li key={i} className="text-sm text-blue-800 flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {message.results.analysis?.recommendations && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {message.results.analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-green-800 flex items-start">
                            <span className="text-green-600 mr-2">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.results.suggestions && message.results.suggestions.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-900 mb-2">
                        Follow-up Questions
                      </h4>
                      <div className="space-y-2">
                        {message.results.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            className="text-sm text-purple-700 hover:text-purple-900 hover:bg-purple-100 px-2 py-1 rounded transition-colors text-left w-full"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 px-1">
              <span className="text-xs text-gray-500">
                {format(message.timestamp, 'HH:mm')}
              </span>
              {message.type === 'assistant' && message.content && (
                <button
                  onClick={() => handleCopy(message.content, message.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  {copiedId === message.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {message.type === 'user' && (
            <div className="flex-shrink-0 order-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default MessageList