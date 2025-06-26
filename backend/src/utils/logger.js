/**
 * Simple logger utility for the application
 * Uses console methods but provides a consistent interface
 */

const logger = {
  info: (...args) => {
    console.log('[INFO]', new Date().toISOString(), ...args);
  },
  
  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  },
  
  warn: (...args) => {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  },
  
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }
};

module.exports = logger;