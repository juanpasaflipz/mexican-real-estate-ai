import React, { useRef, useEffect } from 'react'
import clsx from 'clsx'

interface QueryInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const QueryInput: React.FC<QueryInputProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Ask a question...',
  disabled = false,
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className={clsx(
        'w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12',
        'text-sm text-gray-900 placeholder-gray-500',
        'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        'transition-colors',
        className
      )}
    />
  )
}

export default QueryInput