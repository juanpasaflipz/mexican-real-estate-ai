# Natural Language Database Query Backend

Backend API server that processes natural language queries and converts them to SQL for PostgreSQL databases. Integrates with Claude Desktop MCP for enhanced natural language understanding.

## Features

### Core Functionality
- **Natural Language to SQL**: Convert plain English queries to PostgreSQL SQL
- **Smart Query Analysis**: Automatic data analysis and insights generation
- **Real-time Updates**: WebSocket support for live data streaming
- **Query Templates**: Pre-built queries for common use cases
- **Export Capabilities**: Export results as CSV, JSON, or Excel

### Advanced Features
- **AI Enhancement**: Optional OpenAI integration for complex queries
- **Schema Caching**: Fast schema discovery with intelligent caching
- **Query Suggestions**: Auto-complete and query recommendations
- **Performance Monitoring**: Database health and query performance tracking
- **Security**: Read-only queries with SQL injection protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting
- **AI**: OpenAI API (optional)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Claude Desktop with MCP configured (optional)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname
SUPABASE_DATABASE_URL=postgresql://user:password@host:port/dbname

# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend
CLIENT_URL=http://localhost:5173

# OpenAI (optional)
OPENAI_API_KEY=your-openai-key
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Natural Language Processing

#### Execute Query
```http
POST /api/nlp/query
Content-Type: application/json

{
  "query": "Show me all users who signed up last month"
}
```

Response:
```json
{
  "data": [...],
  "columns": [...],
  "rowCount": 42,
  "executionTime": 125,
  "query": "SELECT * FROM auth.users WHERE created_at >= ...",
  "analysis": {
    "summary": "Found 42 users who signed up last month",
    "insights": ["Peak signup day was the 15th"],
    "patterns": [...],
    "recommendations": [...]
  },
  "visualizations": [...],
  "suggestions": [
    "Show me user activity for these users",
    "Compare with previous month"
  ]
}
```

#### Get Suggestions
```http
GET /api/nlp/suggestions?q=show%20me%20users
```

#### Get Templates
```http
GET /api/nlp/templates?category=analytics
```

### Database Operations

#### Get Schema
```http
GET /api/database/schema
```

#### Table Preview
```http
GET /api/database/tables/users/preview?limit=10
```

#### Database Statistics
```http
GET /api/database/stats
```

### Query Management

#### Save Query
```http
POST /api/queries
Content-Type: application/json

{
  "name": "Monthly User Report",
  "naturalLanguageQuery": "Show me user growth by month",
  "sqlQuery": "SELECT DATE_TRUNC('month', created_at)...",
  "category": "analytics",
  "isFavorite": true
}
```

#### Get Saved Queries
```http
GET /api/queries
GET /api/queries/favorites
GET /api/queries/category/analytics
```

### Export

#### Export Results
```http
POST /api/export
Content-Type: application/json

{
  "results": {...},
  "format": "csv",
  "options": {
    "includeHeaders": true
  }
}
```

## WebSocket Events

### Client → Server

- `subscribe`: Subscribe to real-time query updates
```javascript
socket.emit('subscribe', {
  query: 'Count active users',
  interval: 5000
})
```

- `unsubscribe`: Stop receiving updates
- `enableNotifications`: Enable system notifications

### Server → Client

- `queryResult`: Query execution results
- `error`: Error messages
- `notification`: System notifications

## Natural Language Query Examples

The system understands various query patterns:

### Basic Queries
- "Show me all users"
- "Count orders from today"
- "List top 10 customers"

### Time-based Queries
- "Users who signed up in the last 7 days"
- "Revenue this month vs last month"
- "Daily active users for the past week"

### Analytical Queries
- "What's my user growth rate?"
- "Show me revenue trends"
- "Find anomalies in order data"

### System Queries
- "How big is my database?"
- "Show me the largest tables"
- "Check for slow queries"

## Query Pattern Matching

The system uses multiple strategies:

1. **Exact Templates**: Pre-defined queries for common requests
2. **Pattern Matching**: Regex-based query construction
3. **AI Enhancement**: OpenAI for complex natural language (optional)
4. **Schema Awareness**: Queries adapted to your actual database structure

## Security

### Read-Only Enforcement
- All queries wrapped in READ ONLY transactions
- No INSERT, UPDATE, DELETE, or DDL operations allowed
- Table name validation to prevent SQL injection

### Authentication (Coming Soon)
- JWT-based authentication
- Role-based access control
- Query history per user

### Rate Limiting
- Configurable request limits
- Protection against abuse
- Separate limits for different endpoints

## Performance Optimization

- **Schema Caching**: 5-minute cache for database schema
- **Query Result Caching**: Client-side with React Query
- **Connection Pooling**: Efficient PostgreSQL connections
- **Async Processing**: Non-blocking query execution

## Error Handling

The API provides detailed error messages:

```json
{
  "error": {
    "message": "Table does not exist",
    "status": 400,
    "details": "...",
    "timestamp": "2024-01-20T12:00:00Z"
  }
}
```

Common error codes:
- `400`: Bad request (invalid query, SQL syntax error)
- `401`: Unauthorized (authentication required)
- `404`: Resource not found
- `500`: Internal server error

## Development

### Project Structure
```
backend/
├── src/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   └── utils/          # Helper functions
├── tests/              # Test files
└── package.json
```

### Testing
```bash
npm test
```

### Debugging
Set `NODE_ENV=development` for detailed error messages and stack traces.

## Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Database Migrations
Run any necessary database migrations before deployment.

### Health Check
The `/health` endpoint can be used for monitoring:
```http
GET /health
```

## Integration with Claude Desktop

This backend is designed to work with Claude Desktop MCP:

1. Queries can be initiated from Claude Desktop
2. Results are formatted for optimal display in Claude
3. Natural language understanding is enhanced by Claude's capabilities

## Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License