require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { createServer } = require('http')
const { Server } = require('socket.io')
const rateLimit = require('express-rate-limit')

const nlpRoutes = require('./routes/nlpRoutes')
const databaseRoutes = require('./routes/databaseRoutes')
const queryRoutes = require('./routes/queryRoutes')
const exportRoutes = require('./routes/exportRoutes')
const { errorHandler } = require('./middleware/errorHandler')
const { setupSocketHandlers } = require('./services/socketService')

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
})

// Trust proxy for Render deployment
app.set('trust proxy', true)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
})
app.use('/api', limiter)

// Routes
app.use('/api/nlp', nlpRoutes)
app.use('/api/chat-ai', nlpRoutes)  // Alias for compatibility with old frontend
app.use('/api/database', databaseRoutes)
app.use('/api/queries', queryRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/blog', require('./routes/blogRoutes'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// Socket.io setup
setupSocketHandlers(io)

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})