import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { ColumnInfo } from '@/types'
import clsx from 'clsx'

interface DataTableProps {
  data: any[]
  columns: ColumnInfo[]
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

const DataTable: React.FC<DataTableProps> = ({ data, columns, className }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(
        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
      )
      if (sortDirection === 'desc') {
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnName)
      setSortDirection('asc')
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      let comparison = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime()
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  const formatCellValue = (value: any, columnType: string): string => {
    if (value === null || value === undefined) return '-'
    
    switch (columnType) {
      case 'timestamp':
      case 'timestamptz':
      case 'date':
        return new Date(value).toLocaleString()
      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
        return typeof value === 'number' ? value.toLocaleString() : value
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'json':
      case 'jsonb':
        return JSON.stringify(value, null, 2)
      default:
        return String(value)
    }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data found
      </div>
    )
  }

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.name}
                onClick={() => handleSort(column.name)}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
              >
                <div className="flex items-center gap-1">
                  <span>{column.name}</span>
                  {sortColumn === column.name && (
                    <span className="text-primary-600">
                      {sortDirection === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
                <div className="text-xs font-normal text-gray-400 mt-0.5">
                  {column.type}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.slice(0, 100).map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.name}
                  className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
                  title={formatCellValue(row[column.name], column.type)}
                >
                  {formatCellValue(row[column.name], column.type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 100 && (
        <div className="text-center py-2 text-xs text-gray-500 bg-gray-50">
          Showing first 100 of {data.length} rows
        </div>
      )}
    </div>
  )
}

export default DataTable