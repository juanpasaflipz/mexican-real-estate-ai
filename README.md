# Mexican Real Estate Platform (Redfin-like)

A comprehensive real estate platform for the Mexican market with AI-powered natural language search capabilities.

## Features

### Current Features
- **AI-Powered Search**: Natural language queries using GPT-4o
- **Comprehensive Analytics**: Market insights and property analysis
- **Real-time Data**: Live connection to Supabase PostgreSQL database
- **10,500+ Properties**: Active listings across Mexico
- **Bilingual Support**: Ready for Spanish/English implementation

### Planned Features
- Property listings with photos and virtual tours
- Map-based search interface
- User authentication and profiles
- Agent/agency management
- Mexican-specific features (INFONAVIT, Fideicomiso, etc.)
- Mobile-responsive design

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase)
- **AI**: OpenAI GPT-4o
- **Real-time**: Socket.io

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Supabase account with PostgreSQL database

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd mcp-ai-test-2
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configure environment variables:

Create `.env` file in the backend directory:
```env
# Database Configuration
DATABASE_URL=your_supabase_connection_string
SUPABASE_DATABASE_URL=your_supabase_connection_string

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL
CLIENT_URL=http://localhost:5173

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

### Start both frontend and backend:
```bash
./start-all.sh
```

### Or start individually:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### Natural Language Query
```
POST /api/nlp/query
POST /api/chat-ai/query (alias)

Body:
{
  "query": "Show me all houses in Polanco under 10 million pesos"
}
```

### Database Operations
- `GET /api/database/schema` - Get database schema
- `GET /api/database/stats` - Database statistics
- `GET /api/database/tables/:tableName/preview` - Preview table data

### Query Management
- `GET /api/queries` - Get saved queries
- `POST /api/queries` - Save a query
- `DELETE /api/queries/:id` - Delete saved query

### Export
- `POST /api/export` - Export query results (CSV, JSON, Excel)

## Natural Language Query Examples

### Property Searches
- "Show me all properties in Mexico City"
- "Find houses under 5 million pesos in Polanco"
- "Show me beachfront properties in Cancún"
- "What are the cheapest apartments in Roma Norte?"

### Market Analysis
- "What are the top 10 cities by property count?"
- "Show me property type distribution in CDMX"
- "Compare property prices between Monterrey and Guadalajara"
- "What's the average price per square meter in Polanco?"

### Investment Insights
- "Which neighborhoods have the most commercial properties?"
- "Show me areas with high rental potential"
- "Find undervalued properties in growing markets"

## Project Structure

```
mcp-ai-test-2/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # API services
│   │   ├── pages/         # Page components
│   │   └── hooks/         # Custom React hooks
├── backend/               # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── server.js      # Main server file
├── docs/                  # Documentation
├── CLAUDE.md             # AI assistant reference
└── README.md             # This file
```

## AI Query System Architecture

1. **Query Flow**:
   - User inputs natural language query
   - Frontend sends to `/api/chat-ai/query`
   - Backend uses GPT-4o to generate SQL
   - SQL executed on Supabase (read-only)
   - Results analyzed by GPT-4o
   - Comprehensive insights returned

2. **Key Features**:
   - Context-aware SQL generation
   - Mexican real estate domain knowledge
   - Automatic aggregations and grouping
   - Business intelligence-level analysis

## Database Schema

Current properties table includes:
- `id`, `external_id`
- `title`, `description`
- `price`, `currency`
- `location`, `city`, `state`, `country`
- `bedrooms`, `bathrooms`, `size`
- `property_type`
- `link`, `image_url`
- `created_at`, `updated_at`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Use environment variables for sensitive data

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Claude Code AI assistant
- Powered by OpenAI GPT-4o
- Database hosted on Supabase
- Inspired by Redfin.com