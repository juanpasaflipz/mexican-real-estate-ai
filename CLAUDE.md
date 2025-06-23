# PostgreSQL MCP Server - Claude Reference Guide

## Project Overview

This project connects a Supabase PostgreSQL database to Claude Desktop using the Model Context Protocol (MCP). The setup enables natural language database queries with comprehensive, analytical responses.

### Key Capabilities
- Natural language to SQL translation
- Read-only database access for safety
- Comprehensive data analysis and insights
- Schema exploration and understanding

## Database Connection

### Connection Details
- **Database Type**: PostgreSQL (Supabase hosted)
- **Connection String**: Uses `DATABASE_URL` or `SUPABASE_DATABASE_URL` from environment
- **Host**: `db.pfpyfxspinghdhrjalsg.supabase.co`
- **Port**: `5432`
- **Database Name**: `postgres`
- **User**: `postgres`

### MCP Server Configuration
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:T8cBFXxnxe2rvd8aBuWN@db.pfpyfxspinghdhrjalsg.supabase.co:5432/postgres"
      ]
    }
  }
}
```

## Natural Language Query Guidelines

### Translation Patterns

1. **User Questions → SQL Queries**
   - "Show me all users" → `SELECT * FROM users LIMIT 100;`
   - "How many orders last month?" → `SELECT COUNT(*) FROM orders WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE);`
   - "Top 10 customers by revenue" → `SELECT customer_id, SUM(total_amount) as revenue FROM orders GROUP BY customer_id ORDER BY revenue DESC LIMIT 10;`

2. **Always Provide Context**
   - Explain what the query does
   - Interpret the results
   - Suggest follow-up questions
   - Identify patterns or insights

3. **Response Format**
   ```
   Query executed: [SQL query]
   
   Results: [formatted data]
   
   Analysis:
   - Key findings
   - Patterns observed
   - Recommendations
   
   Suggested follow-up queries:
   - Related questions to explore
   ```

## Common Supabase Schema Patterns

### Standard Tables
- `auth.users` - User authentication data
- `public.profiles` - User profile information
- `storage.objects` - File storage metadata
- `storage.buckets` - Storage bucket configuration

### Schema Discovery Queries
```sql
-- List all tables
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- Get table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'your_table'
ORDER BY ordinal_position;

-- View relationships
SELECT
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## Query Examples Library

### User Analytics
```sql
-- New users by day
SELECT DATE(created_at) as signup_date, COUNT(*) as new_users
FROM auth.users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- User activity patterns
SELECT 
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as activity_count
FROM user_activities
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;
```

### Data Analysis
```sql
-- Monthly growth rate
WITH monthly_counts AS (
    SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
    FROM your_table
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT 
    month,
    count,
    LAG(count) OVER (ORDER BY month) as previous_month,
    ROUND(((count::numeric - LAG(count) OVER (ORDER BY month)) / 
           LAG(count) OVER (ORDER BY month) * 100), 2) as growth_rate
FROM monthly_counts
ORDER BY month DESC;

-- Percentile analysis
SELECT 
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY amount) as q1,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY amount) as median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY amount) as q3,
    AVG(amount) as average,
    MAX(amount) as maximum,
    MIN(amount) as minimum
FROM transactions;
```

### Performance Queries
```sql
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries (if pg_stat_statements enabled)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Response Best Practices

### 1. Comprehensive Analysis
- Always explain what the data shows
- Identify trends and patterns
- Highlight anomalies or interesting findings
- Provide business context when possible

### 2. Error Handling
- If a query fails, explain why
- Suggest corrections
- Offer alternative approaches
- Check for common issues (table names, column names, permissions)

### 3. Follow-up Suggestions
Based on query results, suggest:
- Drill-down queries for more detail
- Related metrics to explore
- Time-based comparisons
- Segmentation opportunities

### 4. Data Formatting
- Use tables for structured data
- Include summary statistics
- Format numbers appropriately (commas, decimals)
- Use relative dates when helpful ("3 days ago" vs specific date)

## Security Guidelines

### Always Remember
1. **Read-Only Access**: All queries run in READ ONLY transactions
2. **No Credentials in Responses**: Never display passwords or sensitive connection details
3. **Environment Variables**: Always reference DATABASE_URL from environment
4. **Data Privacy**: Be mindful of potentially sensitive data in query results

### Safe Query Practices
- Always use parameterized queries when applicable
- Limit result sets to prevent overwhelming responses
- Avoid queries that could impact performance
- Never attempt INSERT, UPDATE, DELETE, or DDL operations

## Testing Procedures

### Connection Test
```sql
-- Basic connection test
SELECT version();
SELECT current_database();
SELECT current_user;
```

### Schema Exploration
```sql
-- Get all schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema');

-- Count tables per schema
SELECT schemaname, COUNT(*) as table_count
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname;
```

### Performance Checks
```sql
-- Database size
SELECT pg_database_size(current_database());

-- Active connections
SELECT count(*) FROM pg_stat_activity;
```

## Natural Language Examples

### User asks: "What's happening with my users?"
1. Check recent signups
2. Analyze activity patterns
3. Identify user segments
4. Show retention metrics
5. Suggest areas for investigation

### User asks: "Is my database healthy?"
1. Check connection count
2. Review table sizes
3. Look for slow queries
4. Check for missing indexes
5. Analyze growth trends

### User asks: "Show me revenue trends"
1. Identify revenue-related tables
2. Calculate period-over-period growth
3. Segment by customer type
4. Show top performers
5. Identify seasonal patterns

## Command References

### Essential Commands
- Schema inspection: Use queries from "Schema Discovery Queries" section
- Performance monitoring: Use queries from "Performance Queries" section
- Data analysis: Apply patterns from "Query Examples Library"

### Quick Checks
```sql
-- Row counts for all tables
SELECT schemaname, tablename, n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Recent changes
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
WHERE n_tup_ins + n_tup_upd + n_tup_del > 0
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
```

## Notes for Future Sessions

- This database is hosted on Supabase
- Primary focus on analytics and reporting
- Natural language interpretation is key
- Always provide comprehensive, actionable insights
- The MCP server provides read-only access for safety
- Connection details are stored in environment variables

## Mexican Real Estate Platform Project (Redfin-like)

### Project Overview
Building a comprehensive real estate platform for the Mexican market, similar to Redfin.com. This platform will leverage our natural language query system for property searches and market analytics.

### Project Status
- **Started**: December 2024
- **Current Phase**: Initial Planning & Architecture
- **Tech Stack**: 
  - Frontend: React + TypeScript (already set up)
  - Backend: Node.js + Express (already set up)
  - Database: PostgreSQL (Supabase)
  - Natural Language Processing: Already implemented
  - Maps: To be determined (Google Maps or Mapbox)

### Key Features to Implement

#### Core Features (Based on Redfin Model)
1. **Property Search & Discovery**
   - Map-based search
   - Natural language search ("Find 3 bedroom homes in Polanco under 5 million pesos")
   - Advanced filters (price, size, amenities, property type)
   - Saved searches with alerts

2. **Property Listings**
   - Detailed property pages
   - High-quality photos and virtual tours
   - Property history and price changes
   - Neighborhood information
   - School districts (adapted for Mexican education system)

3. **Market Analytics**
   - Property value estimates (Mexican market adapted)
   - Market trends by neighborhood
   - Price per square meter analytics
   - Investment opportunity indicators

4. **User Features**
   - User accounts with favorites
   - Property comparison tools
   - Mortgage calculator (Mexican banking)
   - Tour scheduling system

#### Mexican Market Specific Features
1. **Localization**
   - Spanish/English bilingual support
   - Mexican legal documentation (escrituras, predial)
   - Notary (Notario) integration
   - Fideicomiso information for restricted zones

2. **Geographic Considerations**
   - Support for Mexican states and municipalities
   - Colonias and fraccionamientos
   - Beach/restricted zone properties
   - Ejido land identification

3. **Financial Tools**
   - INFONAVIT calculator
   - Mexican bank mortgage options
   - USD/MXN conversion for international buyers
   - Capital gains tax calculator

4. **Legal/Compliance**
   - Anti-money laundering compliance
   - Foreign investment regulations
   - Property title verification
   - Tax (predial) status checking

### Database Schema Design (Planned)

```sql
-- Core tables needed
- properties (id, address, price, bedrooms, bathrooms, size_m2, etc.)
- property_photos
- neighborhoods (colonias)
- municipalities
- states
- agents
- agencies
- users
- saved_searches
- property_views
- price_history
- property_features
- schools
- amenities
- property_documents
- tours
- offers
```

### Natural Language Query Examples for Real Estate

```
"Show me houses in Roma Norte under 10 million pesos"
"What's the average price per m2 in Polanco?"
"Find properties near the American School"
"Show me beachfront condos in Playa del Carmen"
"Properties with good investment potential in CDMX"
"Compare prices in Condesa vs Roma Norte"
"New developments in Querétaro"
```

### Current Project Structure

```
mcp-ai-test-2/
├── frontend/           # React UI (ready for real estate components)
├── backend/           # API server (ready for real estate endpoints)
├── database/          # Schema to be created
└── docs/             # Documentation

Key Files:
- Natural language query system: ✓ Implemented with GPT-4o
- Frontend framework: ✓ Set up
- Backend API: ✓ Set up
- Database connection: ✓ Configured
- AI-powered queries: ✓ Working with comprehensive analysis
```

### Latest Updates (June 23, 2025)

#### ✅ Completed
1. **Enhanced NLP System with AI**
   - Integrated GPT-4o for natural language to SQL conversion
   - Prioritized AI processing over pattern matching
   - Added comprehensive market analysis in responses
   - Fixed markdown formatting issues in SQL responses
   - Added Mexican real estate context (delegaciones, property types, etc.)

2. **Frontend-Backend Integration**
   - Fixed `/api/chat-ai/query` endpoint compatibility
   - Resolved React Markdown rendering issues
   - AI Chat interface now working with comprehensive responses

3. **Current Database Status**
   - 10,539 properties loaded in database
   - Properties table includes: city, state, property_type, price, bedrooms, bathrooms, etc.
   - Top cities: Mérida (403), Cancún (345), Cuauhtémoc (324), Torreón (274)
   - CDMX delegaciones present: Cuauhtémoc, Miguel Hidalgo, Benito Juárez, etc.

#### 🔄 In Progress
- Creating GitHub repository for version control

### Next Steps
1. Create GitHub repository and push code
2. Design complete database schema for Mexican real estate
3. Create property listing UI components
4. Implement map-based search
5. Build property CRUD API endpoints
6. Implement user authentication with JWT
7. Create agent/agency management system
8. Implement Mexican-specific features (INFONAVIT, currency conversion)

### Important URLs and Resources
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Database: Supabase (connection configured)

### Technical Implementation Details

#### AI Query System Architecture
1. **Query Flow**:
   - User inputs natural language query
   - Frontend sends to `/api/chat-ai/query` (or `/api/nlp/query`)
   - Backend prioritizes GPT-4o for SQL generation
   - SQL executed on Supabase PostgreSQL (read-only)
   - Results analyzed by GPT-4o for comprehensive insights
   - Markdown response sent to frontend

2. **Key Files Modified**:
   - `/backend/src/services/nlpService.js` - AI integration
   - `/backend/src/routes/nlpRoutes.js` - Response transformation
   - `/backend/src/server.js` - Route aliasing for compatibility

3. **Environment Variables**:
   - `OPENAI_API_KEY` - Required for AI features
   - `DATABASE_URL` - Supabase connection string
- Database: Supabase (connection configured)

### Commands to Start Project
```bash
# Start all services
./start-all.sh

# Or manually:
cd backend && npm run dev
cd frontend && npm run dev
```