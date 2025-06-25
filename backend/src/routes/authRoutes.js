const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = () => {
  return jwt.sign(
    { type: 'refresh', timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate tokens
      const accessToken = generateToken(req.user);
      const refreshToken = generateRefreshToken();
      
      // Store refresh token in database
      await pool.query(
        `INSERT INTO user_sessions (user_id, refresh_token, expires_at) 
         VALUES ($1, $2, NOW() + INTERVAL '30 days')
         ON CONFLICT (refresh_token) DO NOTHING`,
        [req.user.id, refreshToken]
      );

      // Update last login
      await pool.query(
        'UPDATE app_users SET updated_at = NOW() WHERE id = $1',
        [req.user.id]
      );

      // Redirect to frontend with tokens
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// Get current user
router.get('/me', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  }
);

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    try {
      jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists and is valid
    const sessionResult = await pool.query(
      `SELECT s.*, au.* 
       FROM user_sessions s
       JOIN app_users au ON s.user_id = au.id
       WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found or expired'
      });
    }

    const user = sessionResult.rows[0];
    
    // Generate new access token
    const newAccessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

// Logout
router.post('/logout', 
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Delete refresh token from database
        await pool.query(
          'DELETE FROM user_sessions WHERE refresh_token = $1',
          [refreshToken]
        );
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to logout'
      });
    }
  }
);

// Update user role (admin only)
router.patch('/users/:userId/role',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if current user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      const { userId } = req.params;
      const { role } = req.body;

      if (!['admin', 'analyst', 'viewer'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Valid roles are: admin, analyst, viewer'
        });
      }

      const result = await pool.query(
        'UPDATE app_users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [role, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user role'
      });
    }
  }
);

module.exports = router;