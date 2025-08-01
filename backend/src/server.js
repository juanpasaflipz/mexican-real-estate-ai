require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { createServer } = require('http')
const { Server } = require('socket.io')
const rateLimit = require('express-rate-limit')
const session = require('express-session')
const passport = require('./config/passport')

const nlpRoutes = require('./routes/nlpRoutes')
const databaseRoutes = require('./routes/databaseRoutes')
const queryRoutes = require('./routes/queryRoutes')
const exportRoutes = require('./routes/exportRoutes')
const nearbyRoutes = require('./routes/nearbyRoutes')
const { errorHandler } = require('./middleware/errorHandler')
const { setupSocketHandlers } = require('./services/socketService')

const app = express()
const httpServer = createServer(app)

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://haus.broker',
  'https://www.haus.broker',
  'https://mexican-real-estate-ai-jy2t.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean)

const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true)
      
      // Check if origin is in the allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      }
      
      // Allow all Vercel preview deployments
      if (origin && origin.includes('.vercel.app')) {
        return callback(null, true)
      }
      
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true
  }
})

// Trust proxy for Render deployment
app.set('trust proxy', true)

// Middleware
app.use(helmet())
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Check if origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true)
    }
    
    // Allow all Vercel preview deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000 // Increased for development
})
// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api', limiter)
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/user', require('./routes/userRoutes'))
app.use('/api/nlp', nlpRoutes)
app.use('/api/chat-ai', nlpRoutes)  // Alias for compatibility with old frontend
app.use('/api/database', databaseRoutes)
app.use('/api/queries', queryRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/blog', require('./routes/blogRoutes'))
app.use('/api/properties', require('./routes/propertyRoutes'))
app.use('/api/vector-search', require('./routes/vectorSearchRoutes'))
app.use('/api/landing', require('./routes/landingRoutes'))
app.use('/api', nearbyRoutes)  // Add nearby routes

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