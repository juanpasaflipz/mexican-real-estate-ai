const express = require('express')
const router = express.Router()

// Export query results
router.post('/', (req, res) => {
  try {
    const { results, format, options = {} } = req.body
    
    if (!results || !format) {
      return res.status(400).json({ 
        error: 'Results and format are required' 
      })
    }

    switch (format) {
      case 'csv':
        exportAsCSV(res, results, options)
        break
      case 'json':
        exportAsJSON(res, results, options)
        break
      case 'excel':
        exportAsExcel(res, results, options)
        break
      default:
        res.status(400).json({ error: 'Unsupported format' })
    }
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error.message
    })
  }
})

function exportAsCSV(res, results, options) {
  const { data, columns } = results
  const { includeHeaders = true } = options

  if (!data || data.length === 0) {
    return res.status(400).json({ error: 'No data to export' })
  }

  let csv = ''

  // Add headers
  if (includeHeaders) {
    const headers = columns ? columns.map(c => c.name) : Object.keys(data[0])
    csv += headers.map(h => `"${h}"`).join(',') + '\n'
  }

  // Add data rows
  data.forEach(row => {
    const values = columns 
      ? columns.map(c => formatCSVValue(row[c.name]))
      : Object.values(row).map(formatCSVValue)
    csv += values.join(',') + '\n'
  })

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="export.csv"')
  res.send(csv)
}

function exportAsJSON(res, results, options) {
  const { data, columns, analysis } = results
  const { includeAnalysis = false, pretty = true } = options

  const exportData = {
    exported_at: new Date().toISOString(),
    row_count: data.length,
    columns: columns,
    data: data
  }

  if (includeAnalysis && analysis) {
    exportData.analysis = analysis
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', 'attachment; filename="export.json"')
  res.send(pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData))
}

function exportAsExcel(res, results, options) {
  // For a real implementation, use a library like exceljs
  // This is a simplified version that returns CSV with .xls extension
  const { data, columns } = results
  
  if (!data || data.length === 0) {
    return res.status(400).json({ error: 'No data to export' })
  }

  let tsv = ''

  // Add headers
  const headers = columns ? columns.map(c => c.name) : Object.keys(data[0])
  tsv += headers.join('\t') + '\n'

  // Add data rows
  data.forEach(row => {
    const values = columns 
      ? columns.map(c => formatExcelValue(row[c.name]))
      : Object.values(row).map(formatExcelValue)
    tsv += values.join('\t') + '\n'
  })

  res.setHeader('Content-Type', 'application/vnd.ms-excel')
  res.setHeader('Content-Disposition', 'attachment; filename="export.xls"')
  res.send(tsv)
}

function formatCSVValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value.toString()
}

function formatExcelValue(value) {
  if (value === null || value === undefined) return ''
  return value.toString().replace(/\t/g, ' ')
}

module.exports = router