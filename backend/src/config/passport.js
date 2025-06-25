const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pool = require('./database');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`
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
      
      // Update Google ID if not set
      await pool.query(
        'UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3',
        [profile.id, profile.photos[0]?.value || null, authUserId]
      );
    } else {
      // Create new user in auth.users
      const newAuthUser = await pool.query(
        `INSERT INTO users (email, name, google_id, avatar_url, email_verified, id) 
         VALUES ($1, $2, $3, $4, NOW(), gen_random_uuid()) 
         RETURNING id`,
        [
          profile.emails[0].value,
          profile.displayName,
          profile.id,
          profile.photos[0]?.value || null
        ]
      );
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