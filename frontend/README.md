# Natural Language Database Query Frontend

A modern, responsive frontend for interacting with your PostgreSQL database using natural language queries. Built with React, TypeScript, and Tailwind CSS.

## Features

### 1. Chat Interface
- Natural language query input with auto-suggestions
- Real-time query execution and results
- Syntax-highlighted SQL display
- Interactive data tables with sorting
- Export results to CSV/JSON/Excel
- Query history and favorites
- Intelligent follow-up suggestions

### 2. Visual Analytics Dashboard
- Drag-and-drop widget arrangement
- Real-time data visualization
- Multiple chart types (line, bar, pie, scatter)
- Auto-refreshing widgets
- Command palette for quick queries
- Customizable dashboard layouts

### 3. Advanced Features
- Real-time data updates via WebSocket
- Query result caching
- Responsive design for mobile/tablet
- Dark mode support (coming soon)
- Voice input support (coming soon)

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Charts**: Recharts
- **Build Tool**: Vite
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 3001

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface/     # Chat UI components
│   │   ├── Dashboard/         # Dashboard components
│   │   ├── DataVisualization/ # Chart components
│   │   └── common/           # Shared components
│   ├── services/             # API services
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── styles/              # Global styles
├── public/                  # Static assets
└── package.json
```

## Usage Examples

### Natural Language Queries

1. **Basic Queries**:
   - "Show me all users"
   - "How many orders were placed today?"
   - "What's my total revenue this month?"

2. **Complex Analytics**:
   - "Compare sales performance between last month and this month"
   - "Show me customer retention rate by cohort"
   - "Find anomalies in transaction data"

3. **Data Exploration**:
   - "What tables are in my database?"
   - "Describe the structure of the orders table"
   - "Show me relationships between tables"

### Dashboard Widgets

Create custom widgets by:
1. Click "Natural Language Query" button
2. Type your query (e.g., "Show daily active users")
3. The widget auto-updates based on your refresh interval

## API Integration

The frontend expects the following API endpoints:

- `POST /api/nlp/query` - Execute natural language query
- `GET /api/nlp/suggestions` - Get query suggestions
- `GET /api/database/schema` - Get database schema
- `GET /api/database/stats` - Get database statistics
- `WebSocket /socket.io` - Real-time updates

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Customization

1. **Theme**: Edit `tailwind.config.js` for colors and styling
2. **Charts**: Modify chart colors in `DataVisualization.tsx`
3. **Query Templates**: Add templates in `services/queryTemplates.ts`

## Performance Optimization

- Lazy loading for dashboard widgets
- Query result caching with React Query
- Virtualized tables for large datasets
- Debounced search inputs
- Optimized re-renders with React.memo

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast mode compatible
- Focus indicators on interactive elements

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Future Enhancements

- [ ] Voice input for queries
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Collaborative dashboards
- [ ] Query scheduling
- [ ] Advanced data export options
- [ ] Mobile app (React Native)

## License

MIT License