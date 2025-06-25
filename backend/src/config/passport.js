const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pool = require('./database');

// Google OAuth Strategy
// Helper function to generate username from Google profile
function generateUsername(profile) {
  // Try to generate from email
  if (profile.emails && profile.emails[0]) {
    const emailParts = profile.emails[0].value.split('@');
    return emailParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  // Fallback to name
  if (profile.displayName) {
    return profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  // Last resort: use Google ID
  return `user${profile.id.slice(0, 8)}`;
}

// Determine the correct callback URL based on environment
const apiUrl = process.env.NODE_ENV === 'production' 
  ? process.env.API_URL 
  : 'http://localhost:3001';

const callbackURL = `${apiUrl}/api/auth/google/callback`;

// Log configuration for debugging
console.log('Google OAuth Config:', {
  clientID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
  callbackURL: callbackURL,
  environment: process.env.NODE_ENV || 'development'
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists in auth.users (Supabase)
    const authUserResult = await pool.query(
      'SELECT id FROM users WHERE google_id = $1 OR email = $2',
      [profile.id, profile.emails[0].value]
    );

    let authUserId;
    
    if (authUserResult.rows.length > 0) {
      authUserId = authUserResult.rows[0].id;
      
      // Check if user needs username or Google ID update
      const userDetails = await pool.query(
        'SELECT username, google_id FROM users WHERE id = $1',
        [authUserId]
      );
      
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      // Always update Google ID and avatar
      updates.push(`google_id = $${paramCount++}`);
      values.push(profile.id);
      
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(profile.photos[0]?.value || null);
      
      // Check if username needs to be set
      if (!userDetails.rows[0].username) {
        let username = generateUsername(profile);
        
        // Ensure username is unique
        let usernameExists = true;
        let suffix = 1;
        while (usernameExists) {
          const usernameCheck = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
          );
          if (usernameCheck.rows.length === 0) {
            usernameExists = false;
          } else {
            username = `${generateUsername(profile)}${suffix}`;
            suffix++;
          }
        }
        
        updates.push(`username = $${paramCount++}`);
        values.push(username);
      }
      
      // Update user with any necessary fields
      values.push(authUserId);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    } else {
      // Create new user in auth.users
      // Generate a unique username
      let username = generateUsername(profile);
      
      // Check if username already exists and make it unique if necessary
      let usernameExists = true;
      let suffix = 1;
      while (usernameExists) {
        const usernameCheck = await pool.query(
          'SELECT id FROM users WHERE username = $1',
          [username]
        );
        if (usernameCheck.rows.length === 0) {
          usernameExists = false;
        } else {
          username = `${generateUsername(profile)}${suffix}`;
          suffix++;
        }
      }
      
      // Check if password column exists and handle accordingly
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password'
      `);
      
      let newAuthUser;
      if (columnCheck.rows.length > 0) {
        // Password column exists, insert with NULL password for OAuth
        newAuthUser = await pool.query(
          `INSERT INTO users (email, name, username, google_id, avatar_url, email_verified, id, password) 
           VALUES ($1, $2, $3, $4, $5, NOW(), gen_random_uuid(), NULL) 
           RETURNING id`,
          [
            profile.emails[0].value,
            profile.displayName,
            username,
            profile.id,
            profile.photos[0]?.value || null
          ]
        );
      } else {
        // No password column, use original query
        newAuthUser = await pool.query(
          `INSERT INTO users (email, name, username, google_id, avatar_url, email_verified, id) 
           VALUES ($1, $2, $3, $4, $5, NOW(), gen_random_uuid()) 
           RETURNING id`,
          [
            profile.emails[0].value,
            profile.displayName,
            username,
            profile.id,
            profile.photos[0]?.value || null
          ]
        );
      }
      authUserId = newAuthUser.rows[0].id;
    }

    // Check if user exists in app_users
    const appUserResult = await pool.query(
      'SELECT * FROM app_users WHERE auth_user_id = $1',
      [authUserId]
    );

    let appUser;
    
    if (appUserResult.rows.length > 0) {
      appUser = appUserResult.rows[0];
    } else {
      // Create new app user
      const newAppUser = await pool.query(
        `INSERT INTO app_users (auth_user_id, email, name, role) 
         VALUES ($1, $2, $3, 'user') 
         RETURNING *`,
        [authUserId, profile.emails[0].value, profile.displayName]
      );
      appUser = newAppUser.rows[0];
    }

    return done(null, {
      id: appUser.id,
      authUserId: appUser.auth_user_id,
      email: appUser.email,
      name: appUser.name,
      role: appUser.role,
      avatarUrl: profile.photos[0]?.value || null
    });
  } catch (error) {
    return done(error, null);
  }
}));

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const result = await pool.query(
      `SELECT au.*, u.avatar_url 
       FROM app_users au 
       JOIN users u ON au.auth_user_id = u.id 
       WHERE au.id = $1`,
      [jwtPayload.id]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return done(null, {
        id: user.id,
        authUserId: user.auth_user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url
      });
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      `SELECT au.*, u.avatar_url 
       FROM app_users au 
       JOIN users u ON au.auth_user_id = u.id 
       WHERE au.id = $1`,
      [id]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      done(null, {
        id: user.id,
        authUserId: user.auth_user_id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url
      });
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});

module.exports = passport;