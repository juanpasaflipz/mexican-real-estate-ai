const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/broker-applications/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
    }
  }
});

// Get broker application status
router.get('/broker-application/status',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Check if there's an existing application
      const result = await pool.query(
        `SELECT 
          ba.id,
          ba.status,
          ba.submitted_at,
          ba.reviewed_at,
          ba.review_note
        FROM broker_applications ba
        WHERE ba.user_id = $1
        ORDER BY ba.created_at DESC
        LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          data: {
            status: 'none'
          }
        });
      }

      const application = result.rows[0];
      
      res.json({
        success: true,
        data: {
          status: application.status,
          submittedAt: application.submitted_at,
          reviewedAt: application.reviewed_at,
          reviewNote: application.review_note
        }
      });
    } catch (error) {
      console.error('Error fetching broker application status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch application status'
      });
    }
  }
);

// Submit broker application
router.post('/broker-application',
  passport.authenticate('jwt', { session: false }),
  upload.array('documents', 5),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        licenseNumber,
        brokerageName,
        yearsExperience,
        phoneNumber,
        specializations,
        aboutMe
      } = req.body;

      // Check if user already has a pending or approved application
      const existingApp = await pool.query(
        `SELECT status FROM broker_applications 
         WHERE user_id = $1 AND status IN ('pending', 'approved')`,
        [userId]
      );

      if (existingApp.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: existingApp.rows[0].status === 'approved' 
            ? 'Ya eres un agente aprobado' 
            : 'Ya tienes una solicitud pendiente'
        });
      }

      // Check if user was rejected within 30 days
      const recentRejection = await pool.query(
        `SELECT reviewed_at FROM broker_applications 
         WHERE user_id = $1 AND status = 'rejected' 
         AND reviewed_at > NOW() - INTERVAL '30 days'
         ORDER BY reviewed_at DESC LIMIT 1`,
        [userId]
      );

      if (recentRejection.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Debes esperar 30 días desde tu última solicitud rechazada'
        });
      }

      // Store file paths
      const documentPaths = req.files ? req.files.map(file => file.path) : [];

      // Insert application
      const result = await pool.query(
        `INSERT INTO broker_applications (
          user_id,
          license_number,
          brokerage_name,
          years_experience,
          phone_number,
          specializations,
          about_me,
          documents,
          status,
          submitted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())
        RETURNING id`,
        [
          userId,
          licenseNumber,
          brokerageName || null,
          yearsExperience,
          phoneNumber,
          specializations ? JSON.parse(specializations) : [],
          aboutMe || null,
          documentPaths
        ]
      );

      // TODO: Send email notification to admins about new application

      res.json({
        success: true,
        data: {
          applicationId: result.rows[0].id,
          message: 'Solicitud enviada con éxito. Te notificaremos cuando tengamos una respuesta.'
        }
      });
    } catch (error) {
      console.error('Error submitting broker application:', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar la solicitud'
      });
    }
  }
);

// Admin: Get all broker applications
router.get('/admin/broker-applications',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      const { status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          ba.*,
          au.name as user_name,
          au.email as user_email
        FROM broker_applications ba
        JOIN app_users au ON ba.user_id = au.id
        WHERE 1=1
      `;

      const queryParams = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND ba.status = $${paramCount}`;
        queryParams.push(status);
      }

      query += ` ORDER BY ba.submitted_at DESC`;
      
      // Add pagination
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      queryParams.push(limit);
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      queryParams.push(offset);

      const result = await pool.query(query, queryParams);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM broker_applications ba
        WHERE 1=1
      `;

      if (status) {
        countQuery += ` AND ba.status = $1`;
      }

      const countResult = await pool.query(
        countQuery,
        status ? [status] : []
      );

      res.json({
        success: true,
        data: {
          applications: result.rows,
          pagination: {
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(countResult.rows[0].count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching broker applications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch applications'
      });
    }
  }
);

// Admin: Review broker application
router.post('/admin/broker-applications/:id/review',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      const { id } = req.params;
      const { action, reviewNote } = req.body;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be "approve" or "reject"'
        });
      }

      await client.query('BEGIN');

      // Update application status
      const updateResult = await client.query(
        `UPDATE broker_applications 
         SET 
           status = $1,
           reviewed_at = NOW(),
           reviewed_by = $2,
           review_note = $3
         WHERE id = $4 AND status = 'pending'
         RETURNING user_id`,
        [
          action === 'approve' ? 'approved' : 'rejected',
          req.user.id,
          reviewNote || null,
          id
        ]
      );

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Application not found or already reviewed'
        });
      }

      const userId = updateResult.rows[0].user_id;

      // If approved, update user role to broker
      if (action === 'approve') {
        await client.query(
          `UPDATE app_users 
           SET role = 'broker', updated_at = NOW() 
           WHERE id = $1`,
          [userId]
        );
      }

      await client.query('COMMIT');

      // TODO: Send email notification to user about application status

      res.json({
        success: true,
        data: {
          message: action === 'approve' 
            ? 'Application approved successfully' 
            : 'Application rejected',
          userId
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error reviewing broker application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to review application'
      });
    } finally {
      client.release();
    }
  }
);

// Get recent users for admin dashboard
router.get('/admin/users/recent',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      const result = await pool.query(`
        SELECT 
          id,
          name,
          email,
          role,
          created_at
        FROM app_users
        ORDER BY created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          users: result.rows
        }
      });
    } catch (error) {
      console.error('Error fetching recent users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent users'
      });
    }
  }
);

// Moderation queue for admin dashboard
router.get('/admin/moderation/queue',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // This would fetch properties pending moderation
      // For now, return empty array
      res.json({
        success: true,
        data: {
          pending: 0,
          items: []
        }
      });
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch moderation queue'
      });
    }
  }
);

// System health check for admin dashboard
router.get('/admin/system/health',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Check various system components
      const health = {
        api: { status: 'healthy' },
        database: { status: 'healthy' },
        pinecone: { status: 'healthy' },
        cache: { status: 'healthy' },
        lastChecked: new Date().toISOString()
      };

      // Check database
      try {
        await pool.query('SELECT 1');
      } catch (error) {
        health.database.status = 'error';
      }

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      console.error('Error checking system health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check system health'
      });
    }
  }
);

// Revenue metrics for admin dashboard
router.get('/admin/revenue',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Mock revenue data for now
      const revenue = {
        thisMonth: 150000,
        monthGrowth: 12.5,
        activeSubscriptions: 45,
        newSubscriptions: 8,
        conversionRate: 3.2
      };

      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue metrics'
      });
    }
  }
);

// Broker dashboard stats
router.get('/broker/stats',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is broker
      if (req.user.role !== 'broker') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Broker access required'
        });
      }

      const userId = req.user.id;

      // Get various stats for the broker
      // This is a placeholder - you'll need to adjust based on your actual schema
      const stats = {
        listings: {
          total: 0,
          active: 0,
          pending: 0
        },
        leads: {
          new: 0,
          total: 0
        },
        commissions: {
          thisMonth: 0,
          pending: 0,
          yearTotal: 0
        },
        appointments: {
          today: 0,
          upcoming: []
        },
        performance: {
          viewsTotal: 0,
          viewsTrend: 0,
          inquiries: 0,
          showings: 0,
          closedDeals: 0
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching broker stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch broker statistics'
      });
    }
  }
);

// Admin dashboard stats
router.get('/admin/stats',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Get platform statistics
      const stats = {
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalProperties: 0,
        activeProperties: 0,
        dailyActiveUsers: 0,
        searchesToday: 0
      };

      // Get user stats
      const userStats = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_users_month
        FROM app_users
      `);

      if (userStats.rows.length > 0) {
        stats.totalUsers = parseInt(userStats.rows[0].total_users);
        stats.newUsersThisMonth = parseInt(userStats.rows[0].new_users_month);
      }

      // Get property stats
      const propertyStats = await pool.query(`
        SELECT 
          COUNT(*) as total_properties,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_properties
        FROM properties
      `);

      if (propertyStats.rows.length > 0) {
        stats.totalProperties = parseInt(propertyStats.rows[0].total_properties);
        stats.activeProperties = parseInt(propertyStats.rows[0].active_properties);
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admin statistics'
      });
    }
  }
);

// Broker listings
router.get('/broker/listings',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is broker
      if (req.user.role !== 'broker') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Broker access required'
        });
      }

      // Mock data for now
      res.json({
        success: true,
        data: {
          total: 12,
          active: 8,
          pending: 2,
          topPerformers: [
            { id: 1, title: 'Casa en Polanco', views: 245 },
            { id: 2, title: 'Depto en Roma Norte', views: 189 },
            { id: 3, title: 'Casa en Coyoacán', views: 156 }
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching broker listings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch broker listings'
      });
    }
  }
);

// Broker leads
router.get('/broker/leads',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is broker
      if (req.user.role !== 'broker') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Broker access required'
        });
      }

      // Mock data for now
      res.json({
        success: true,
        data: {
          new: 3,
          leads: [
            {
              id: 1,
              name: 'María García',
              email: 'maria@example.com',
              property: 'Casa en Polanco',
              createdAt: new Date()
            },
            {
              id: 2,
              name: 'Juan Pérez',
              email: 'juan@example.com',
              property: 'Depto en Roma Norte',
              createdAt: new Date(Date.now() - 86400000)
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching broker leads:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch broker leads'
      });
    }
  }
);

// Broker commissions
router.get('/broker/commissions',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is broker
      if (req.user.role !== 'broker') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Broker access required'
        });
      }

      // Mock data for now
      res.json({
        success: true,
        data: {
          thisMonth: 85000,
          pending: 32000,
          yearTotal: 450000
        }
      });
    } catch (error) {
      console.error('Error fetching broker commissions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch broker commissions'
      });
    }
  }
);

// Broker appointments
router.get('/broker/appointments/upcoming',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is broker
      if (req.user.role !== 'broker') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Broker access required'
        });
      }

      // Mock data for now
      res.json({
        success: true,
        data: {
          appointments: [
            {
              id: 1,
              clientName: 'Ana Martínez',
              property: 'Casa en Polanco',
              monthShort: 'DIC',
              day: '28',
              time: '10:00 AM'
            },
            {
              id: 2,
              clientName: 'Roberto Silva',
              property: 'Depto en Condesa',
              monthShort: 'DIC',
              day: '29',
              time: '3:00 PM'
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching broker appointments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch broker appointments'
      });
    }
  }
);

// Broker performance
router.get('/broker/performance',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check if user is broker
      if (req.user.role !== 'broker') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Broker access required'
        });
      }

      // Mock data for now
      res.json({
        success: true,
        data: {
          viewsTotal: 1234,
          viewsTrend: 15,
          inquiries: 45,
          showings: 12,
          closedDeals: 3
        }
      });
    } catch (error) {
      console.error('Error fetching broker performance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch broker performance'
      });
    }
  }
);

module.exports = router;