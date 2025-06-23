# PostgreSQL MCP Test Queries

## Connection Test Queries

### 1. Basic Connection Test
Ask Claude: "Can you connect to my PostgreSQL database and verify the connection?"

Expected response: Claude should execute:
```sql
SELECT version();
SELECT current_database();
SELECT current_user;
```

### 2. Schema Discovery
Ask Claude: "What tables are in my database?"

Expected response: Claude should list all schemas and tables with:
```sql
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;
```

## Natural Language Query Examples

### User Management Queries

1. **"Show me how many users I have"**
   - Claude will count users from auth.users table
   - Provide total count and recent growth

2. **"Who are my most recent users?"**
   - Display last 10-20 user signups
   - Include signup dates and any profile information

3. **"How is user growth trending?"**
   - Show daily/weekly/monthly signup trends
   - Calculate growth rates
   - Identify patterns

### Data Analysis Queries

1. **"What's the busiest time of day for my application?"**
   - Analyze activity by hour
   - Show peak usage times
   - Suggest optimization opportunities

2. **"Show me my top performing [items/products/content]"**
   - Identify relevant tables
   - Rank by appropriate metrics
   - Provide insights on success factors

3. **"Are there any data anomalies I should know about?"**
   - Check for NULL values
   - Identify outliers
   - Find data inconsistencies

### Performance Queries

1. **"How big is my database?"**
   - Show total database size
   - Break down by table
   - Identify largest tables

2. **"Which tables are growing fastest?"**
   - Compare table sizes over time
   - Calculate growth rates
   - Project future needs

## Advanced Natural Language Examples

### Complex Analysis Requests

1. **"Analyze my customer behavior patterns"**
   Claude should:
   - Identify customer-related tables
   - Analyze purchase frequency
   - Segment customers
   - Show retention metrics
   - Suggest improvements

2. **"Help me understand my business metrics"**
   Claude should:
   - Discover metric-related tables
   - Calculate KPIs
   - Show trends over time
   - Compare periods
   - Highlight concerns

3. **"What insights can you find in my data?"**
   Claude should:
   - Explore schema comprehensively
   - Identify interesting patterns
   - Show correlations
   - Suggest areas for deeper analysis

## Testing the Natural Language Understanding

### Vague Queries (Claude should ask for clarification)

1. "Show me the data"
   - Claude should ask: "What specific data would you like to see?"

2. "How's it going?"
   - Claude should provide a database health overview

3. "Find problems"
   - Claude should check for common issues:
     - Missing indexes
     - Large tables
     - Slow queries
     - Data quality issues

### Specific Domain Queries

1. **E-commerce**: "What's my average order value?"
2. **SaaS**: "What's my churn rate?"
3. **Content**: "Which content performs best?"
4. **Social**: "How engaged are my users?"

## Expected Comprehensive Responses

For each query, Claude should provide:

1. **The SQL Query**: Show what was executed
2. **Results**: Formatted data in tables or lists
3. **Analysis**: 
   - What the data means
   - Trends and patterns
   - Comparisons to benchmarks
4. **Recommendations**: 
   - Actions to take
   - Areas to investigate
   - Follow-up queries
5. **Visualizations**: Describe how data could be visualized

## Error Handling Tests

1. **Ask for a non-existent table**: "Show me data from the unicorns table"
   - Claude should handle gracefully
   - Suggest similar table names

2. **Request write operation**: "Delete all test users"
   - Claude should explain read-only limitation
   - Suggest safe alternatives

3. **Complex join request**: "Connect all my tables and show relationships"
   - Claude should explain the complexity
   - Break down into manageable queries

## Performance Considerations

When testing, Claude should:
- Add LIMIT clauses to prevent huge result sets
- Use indexes when available
- Suggest query optimizations
- Warn about potentially slow operations