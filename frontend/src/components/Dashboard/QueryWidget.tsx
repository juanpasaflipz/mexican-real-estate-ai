import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Maximize2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { nlpQueryService } from '@/services/api'
import DataVisualization from '../DataVisualization/DataVisualization'
import DataTable from '../ChatInterface/DataTable'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface QueryWidgetProps {
  title: string
  query: string
  icon: LucideIcon
  displayType?: 'table' | 'line' | 'bar' | 'pie' | 'scatter' | 'auto'
  refreshInterval?: number
  className?: string
}

const QueryWidget: React.FC<QueryWidgetProps> = ({
  title,
  query,
  icon: Icon,
  displayType = 'auto',
  refreshInterval,
  className
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['widget', query],
    queryFn: () => nlpQueryService.executeQuery(query),
    refetchInterval: refreshInterval,
    staleTime: refreshInterval ? refreshInterval / 2 : undefined
  })

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              Loading data...
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p className="text-sm">Failed to load data</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    if (!data || !data.data || data.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      )
    }

    // Determine display type
    let actualDisplayType = displayType
    if (displayType === 'auto') {
      if (data.visualizations && data.visualizations.length > 0) {
        actualDisplayType = data.visualizations[0].type
      } else {
        actualDisplayType = 'table'
      }
    }

    // Render visualization
    if (actualDisplayType !== 'table' && data.visualizations) {
      const vizConfig = data.visualizations.find(v => v.type === actualDisplayType) || data.visualizations[0]
      if (vizConfig) {
        return <DataVisualization config={vizConfig} />
      }
    }

    // Default to table
    return (
      <div className="overflow-auto max-h-64">
        <DataTable
          data={data.data}
          columns={data.columns}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('bg-white rounded-lg shadow-sm border border-gray-200', className)}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
            <button
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Expand"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {refreshInterval && (
          <p className="text-xs text-gray-500 mt-1">
            Auto-refreshes every {Math.round(refreshInterval / 60000)} minutes
          </p>
        )}
      </div>

      <div className="p-4">
        {renderContent()}
        
        {data?.analysis?.summary && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{data.analysis.summary}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default QueryWidget