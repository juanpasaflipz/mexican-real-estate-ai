# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Haus Broker is a real estate platform with AI-powered search capabilities, similar to Zillow but optimized for the Mexican market. The platform uses natural language processing to help users find properties and provides an Airbnb-style UX.

## Key Commands

```bash
# Development
npm run dev:all              # Start both frontend and backend
npm run dev:frontend         # Start frontend only (port 5173/5174)
npm run dev:backend          # Start backend only (port 3001)

# Backend specific
cd backend && npm run test:connection  # Test Supabase connection
cd backend && npm run typecheck       # TypeScript type checking
cd backend && npm run lint            # ESLint

# Build & Deploy
npm run build:all            # Build both frontend and backend
npm run db:init              # Initialize database schema
npm run db:migrate           # Run migrations
npm run db:seed              # Seed sample data
```

## Architecture & Technical Stack

### Core Services & Dependencies
- **Database**: Supabase (PostgreSQL) - Currently has ~12k production properties
- **Vector Search**: Pinecone (index: `haus-broker-1536`) - For semantic property search
- **AI**: OpenAI GPT-4 - Natural language to SQL conversion and search enhancement
- **Auth**: Google OAuth 2.0 + JWT tokens
- **Maps**: Google Maps API (optional, key may be missing)

### Backend Architecture

The backend follows a layered architecture:
1. **Routes** → **Controllers** → **Services** → **External APIs**
2. All TypeScript with strict typing
3. Middleware for auth, validation, rate limiting, and error handling

Key service patterns:
- `DatabaseService`: Handles all Supabase operations, includes RLS policies
- `PineconeService`: Manages vector embeddings and semantic search
- `AIService`: Processes natural language queries through dual approach:
  - Converts NL to SQL for structured queries
  - Uses vector search for semantic matching
  - Combines results and generates AI response

### Frontend Architecture

React app with:
- Zustand for state management (auth store)
- React Query for API data fetching
- React Router for navigation
- Tailwind CSS for styling
- Protected routes using auth middleware

## Database Schema Considerations

The production database has some differences from the schema.sql:
- `transaction_type` column may be missing
- `featured` column may not exist
- `status` column might have different values
- Properties table has ~12k records

When writing queries, always check for column existence and handle missing fields gracefully.

## API Endpoints Pattern

All API endpoints follow this structure:
```
/api/{resource}/{action}
```

Response format:
```json
{
  "success": boolean,
  "data": { ... } | null,
  "error": { "message": string } | null
}
```

## Natural Language Search Flow

1. User query → `/api/ai/query`
2. AIService generates embeddings via OpenAI
3. Parallel search:
   - Pinecone vector search for semantic matches
   - GPT-4 generates SQL for structured search
4. Results merged and ranked
5. GPT-4 generates natural language response
6. Returns markdown-formatted results with suggestions

## Environment Variables

The `.env` file must be in the project root (not in backend/). Key variables:
- `SUPABASE_URL`, `SUPABASE_KEY`: Database connection
- `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`: Vector search
- `OPENAI_API_KEY`: AI features (used twice in some configs)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: OAuth
- `JWT_SECRET`: Token signing

## Common Issues & Solutions

1. **Backend can't find .env**: The backend looks for .env in parent directory via `path.resolve(__dirname, '../../.env')`

2. **500 errors on API calls**: Usually database schema mismatches. Check if columns exist before querying.

3. **Missing transaction_type**: The production database may not have all columns from schema.sql. Make fields optional in TypeScript interfaces.

4. **Port conflicts**: Frontend defaults to 5173, but may use 5174 if occupied.

## Production Deployment

- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Render
- **Database**: Supabase (use connection pooler for Render)
- **Domain**: Custom domain configuration required

## Testing & Debugging

For database issues:
1. Run `cd backend && npm run test:connection` to verify Supabase connection
2. Check `/debug` endpoint for raw database access
3. Use `database/check-existing-schema.sql` to verify table structure
4. Run `database/add-missing-features.sql` if search features are needed

## Security Considerations

- All user inputs are validated with Zod schemas
- Rate limiting on AI endpoints (10 req/min for queries)
- RLS policies enabled on all tables
- JWT tokens expire after 7 days
- Sensitive operations require authentication + role authorization