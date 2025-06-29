#!/usr/bin/env node

import { readFileSync } from 'fs'
import { join } from 'path'

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
}

function colorize(text, color) {
  return `${color}${text}${COLORS.reset}`
}

function getColorForCoverage(percentage, threshold) {
  if (percentage >= threshold) return COLORS.green
  if (percentage >= threshold - 10) return COLORS.yellow
  return COLORS.red
}

function formatPercentage(value) {
  return `${value.toFixed(2)}%`
}

try {
  // Read coverage summary
  const coveragePath = join(process.cwd(), 'coverage', 'coverage-summary.json')
  const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'))
  
  const thresholds = {
    lines: 80,
    statements: 80,
    functions: 80,
    branches: 75
  }
  
  console.log('\n' + colorize('📊 Coverage Report', COLORS.bold))
  console.log('=' .repeat(50))
  
  let allPassed = true
  const total = coverage.total
  
  // Check each metric
  Object.entries(thresholds).forEach(([metric, threshold]) => {
    const percentage = total[metric].pct
    const covered = total[metric].covered
    const total_count = total[metric].total
    const color = getColorForCoverage(percentage, threshold)
    const status = percentage >= threshold ? '✅' : '❌'
    const passed = percentage >= threshold
    
    if (!passed) allPassed = false
    
    console.log(
      `${status} ${metric.padEnd(12)} ${colorize(formatPercentage(percentage).padStart(8), color)} ` +
      `(${covered}/${total_count}) ${passed ? '' : colorize(`[threshold: ${threshold}%]`, COLORS.red)}`
    )
  })
  
  console.log('=' .repeat(50))
  
  // Show files with low coverage
  const files = Object.entries(coverage)
    .filter(([path]) => path !== 'total')
    .map(([path, data]) => ({
      path,
      lines: data.lines.pct,
      statements: data.statements.pct,
      functions: data.functions.pct,
      branches: data.branches.pct
    }))
    .filter(file => 
      file.lines < thresholds.lines ||
      file.statements < thresholds.statements ||
      file.functions < thresholds.functions ||
      file.branches < thresholds.branches
    )
    .sort((a, b) => Math.min(a.lines, a.statements, a.functions, a.branches) - 
                     Math.min(b.lines, b.statements, b.functions, b.branches))
  
  if (files.length > 0) {
    console.log('\n' + colorize('📝 Files Below Threshold:', COLORS.bold))
    console.log('-' .repeat(50))
    
    files.slice(0, 10).forEach(file => {
      const minCoverage = Math.min(file.lines, file.statements, file.functions, file.branches)
      const color = getColorForCoverage(minCoverage, 70)
      
      console.log(`${colorize('▸', COLORS.yellow)} ${file.path}`)
      console.log(`  Lines: ${formatPercentage(file.lines)}, ` +
                  `Statements: ${formatPercentage(file.statements)}, ` +
                  `Functions: ${formatPercentage(file.functions)}, ` +
                  `Branches: ${formatPercentage(file.branches)}`)
    })
    
    if (files.length > 10) {
      console.log(`\n... and ${files.length - 10} more files`)
    }
  }
  
  // Summary
  console.log('\n' + colorize('📈 Summary:', COLORS.bold))
  if (allPassed) {
    console.log(colorize('✅ All coverage thresholds met!', COLORS.green))
    process.exit(0)
  } else {
    console.log(colorize('❌ Coverage thresholds not met!', COLORS.red))
    console.log('\nTo improve coverage:')
    console.log('1. Write tests for uncovered code')
    console.log('2. Remove dead code')
    console.log('3. Focus on critical paths first')
    process.exit(1)
  }
  
} catch (error) {
  console.error(colorize('❌ Error reading coverage report:', COLORS.red))
  console.error(error.message)
  console.error('\nMake sure to run coverage first: npm run test:coverage')
  process.exit(1)
}