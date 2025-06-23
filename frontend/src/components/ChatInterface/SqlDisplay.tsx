import React, { useState } from 'react'
import { Code, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import clsx from 'clsx'

SyntaxHighlighter.registerLanguage('sql', sql)

interface SqlDisplayProps {
  query: string
  className?: string
}

const SqlDisplay: React.FC<SqlDisplayProps> = ({ query, className }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={clsx('bg-gray-900 rounded-lg overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">SQL Query</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            title="Copy SQL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div
        className={clsx(
          'transition-all duration-300 overflow-hidden',
          isExpanded ? 'max-h-96' : 'max-h-32'
        )}
      >
        <SyntaxHighlighter
          language="sql"
          style={atomOneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}
          wrapLines
          wrapLongLines
        >
          {query}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default SqlDisplay