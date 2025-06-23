import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { VisualizationConfig } from '@/types'

interface DataVisualizationProps {
  config: VisualizationConfig
  className?: string
}

const COLORS = [
  '#3b82f6', // primary-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
]

const DataVisualization: React.FC<DataVisualizationProps> = ({ config, className }) => {
  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return (
          <LineChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey={config.xAxis} 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={config.yAxis || 'value'}
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={{ fill: COLORS[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey={config.xAxis}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem'
              }}
            />
            <Legend />
            <Bar dataKey={config.yAxis || 'value'} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {config.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem'
              }}
            />
          </PieChart>
        )

      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              dataKey={config.xAxis}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              type="number" 
              dataKey={config.yAxis}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem'
              }}
            />
            <Scatter name="Data" data={config.data} fill={COLORS[0]} />
          </ScatterChart>
        )

      default:
        return <div>Unsupported chart type: {config.type}</div>
    }
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">{config.title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

export default DataVisualization