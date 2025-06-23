export interface QueryMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  query?: string
  results?: QueryResult
  error?: string
  isLoading?: boolean
}

export interface QueryResult {
  data: any[]
  columns: ColumnInfo[]
  rowCount: number
  executionTime: number
  analysis?: DataAnalysis
  suggestions?: string[]
  visualizations?: VisualizationConfig[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
}

export interface DataAnalysis {
  summary: string
  insights: string[]
  patterns: Pattern[]
  recommendations: string[]
}

export interface Pattern {
  type: 'trend' | 'anomaly' | 'correlation' | 'distribution'
  description: string
  significance: 'high' | 'medium' | 'low'
  affectedColumns?: string[]
}

export interface VisualizationConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap'
  title: string
  xAxis?: string
  yAxis?: string
  data: any[]
  options?: any
}

export interface SavedQuery {
  id: string
  name: string
  description?: string
  naturalLanguageQuery: string
  sqlQuery: string
  createdAt: Date
  lastUsed?: Date
  category?: string
  isFavorite: boolean
}

export interface DatabaseSchema {
  tables: TableInfo[]
  relationships: Relationship[]
}

export interface TableInfo {
  schema: string
  name: string
  columns: ColumnInfo[]
  rowCount?: number
  size?: string
}

export interface Relationship {
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultVisualization: 'table' | 'chart'
  autoExecute: boolean
  showSqlQuery: boolean
  maxResults: number
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel'
  includeHeaders: boolean
  includeAnalysis: boolean
}