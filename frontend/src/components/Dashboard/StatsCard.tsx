import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: string
  loading?: boolean
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  loading = false,
  className
}) => {
  const isPositiveTrend = trend && trend.startsWith('+')
  const isNegativeTrend = trend && trend.startsWith('-')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-2">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : (
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          {trend && !loading && (
            <div className="mt-2 flex items-center gap-1">
              {isPositiveTrend && (
                <TrendingUp className="w-4 h-4 text-green-600" />
              )}
              {isNegativeTrend && (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={clsx(
                  'text-sm font-medium',
                  isPositiveTrend && 'text-green-600',
                  isNegativeTrend && 'text-red-600',
                  !isPositiveTrend && !isNegativeTrend && 'text-gray-600'
                )}
              >
                {trend}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div
            className={clsx(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              'bg-primary-50 text-primary-600'
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard