const nlpService = require('./nlpService')

const activeSubscriptions = new Map()

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Handle real-time query subscriptions
    socket.on('subscribe', async ({ query, interval = 5000 }) => {
      console.log(`Client ${socket.id} subscribing to query:`, query)
      
      // Clear any existing subscription
      if (activeSubscriptions.has(socket.id)) {
        clearInterval(activeSubscriptions.get(socket.id))
      }

      // Execute query immediately
      try {
        const result = await nlpService.processQuery(query)
        socket.emit('queryResult', result)
      } catch (error) {
        socket.emit('error', { message: error.message })
      }

      // Set up periodic execution
      const intervalId = setInterval(async () => {
        try {
          const result = await nlpService.processQuery(query)
          socket.emit('queryResult', result)
        } catch (error) {
          socket.emit('error', { message: error.message })
        }
      }, interval)

      activeSubscriptions.set(socket.id, intervalId)
    })

    // Handle unsubscribe
    socket.on('unsubscribe', () => {
      console.log(`Client ${socket.id} unsubscribing`)
      if (activeSubscriptions.has(socket.id)) {
        clearInterval(activeSubscriptions.get(socket.id))
        activeSubscriptions.delete(socket.id)
      }
    })

    // Handle real-time notifications
    socket.on('enableNotifications', ({ types = ['all'] }) => {
      console.log(`Client ${socket.id} enabling notifications for:`, types)
      socket.join('notifications')
      
      // Example: Send a test notification
      socket.emit('notification', {
        type: 'info',
        title: 'Notifications Enabled',
        message: 'You will now receive real-time updates',
        timestamp: new Date()
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      if (activeSubscriptions.has(socket.id)) {
        clearInterval(activeSubscriptions.get(socket.id))
        activeSubscriptions.delete(socket.id)
      }
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  // Broadcast system notifications
  setInterval(() => {
    io.to('notifications').emit('notification', {
      type: 'system',
      title: 'System Status',
      message: 'All systems operational',
      timestamp: new Date()
    })
  }, 60000) // Every minute

  return io
}

// Utility function to broadcast to all clients
function broadcast(io, event, data) {
  io.emit(event, data)
}

// Utility function to send to specific room
function sendToRoom(io, room, event, data) {
  io.to(room).emit(event, data)
}

module.exports = {
  setupSocketHandlers,
  broadcast,
  sendToRoom
}