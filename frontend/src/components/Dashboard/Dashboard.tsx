import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Database, 
  Activity,
  TrendingUp,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react'
import { databaseService, nlpQueryService } from '@/services/api'
import QueryWidget from './QueryWidget'
import StatsCard from './StatsCard'
import { motion } from 'framer-motion'

const Dashboard: React.FC = () => {
  const [commandQuery, setCommandQuery] = useState('')
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  const { data: dbStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dbStats'],
    queryFn: databaseService.getStats
  })

  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ['schema'],
    queryFn: databaseService.getSchema
  })

  const handleCommandSubmit = async (query: string) => {
    setShowCommandPalette(false)
    setCommandQuery('')
    // Execute the query and update appropriate widget
    await nlpQueryService.executeQuery(query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Natural Language Query
            </button>
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Chat View
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Tables"
            value={schema?.tables.length || 0}
            icon={Database}
            trend="+0%"
            loading={schemaLoading}
          />
          <StatsCard
            title="Active Queries"
            value={dbStats?.activeQueries || 0}
            icon={Activity}
            trend="+12%"
            loading={statsLoading}
          />
          <StatsCard
            title="Total Records"
            value={dbStats?.totalRecords || 0}
            icon={TrendingUp}
            trend="+5.2%"
            loading={statsLoading}
          />
          <StatsCard
            title="Database Size"
            value={dbStats?.databaseSize || '0 MB'}
            icon={Clock}
            loading={statsLoading}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* User Growth Widget */}
          <QueryWidget
            title="User Growth"
            query="Show me user growth over the last 30 days"
            icon={Users}
            refreshInterval={300000} // 5 minutes
          />

          {/* Recent Activity Widget */}
          <QueryWidget
            title="Recent Activity"
            query="Show me the most recent 10 activities"
            icon={Activity}
            displayType="table"
          />

          {/* Top Performers Widget */}
          <QueryWidget
            title="Top Performers"
            query="Show me the top 5 performing items"
            icon={TrendingUp}
            displayType="bar"
          />

          {/* Data Health Widget */}
          <QueryWidget
            title="Data Health"
            query="Check for any data quality issues"
            icon={AlertCircle}
            className="lg:col-span-2 xl:col-span-1"
          />

          {/* Custom Metric Widget */}
          <QueryWidget
            title="Revenue Trends"
            query="Show me revenue trends for the last 90 days"
            icon={TrendingUp}
            displayType="line"
            className="lg:col-span-2"
          />
        </div>
      </main>

      {/* Command Palette */}
      {showCommandPalette && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
          onClick={() => setShowCommandPalette(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCommandSubmit(commandQuery)
              }}
              className="p-4"
            >
              <input
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Ask a question about your data..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </form>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-500">
                Press Enter to execute • Esc to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard