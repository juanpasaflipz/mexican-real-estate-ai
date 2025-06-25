# Mucha Casa - Environment Variables Configuration

## Frontend Environment Variables

### Development (.env)
```bash
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Production (.env.production)
```bash
# Update this when backend is deployed to new domain
VITE_API_URL=https://api.mucha.casa/api
# Or use the current Render URL until custom domain is set up
# VITE_API_URL=https://mucha-casa-api.onrender.com/api

VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_api_key
```

## Backend Environment Variables

### Development (.env)
```bash
# Database
DATABASE_URL=your_supabase_database_url
SUPABASE_DATABASE_URL=your_supabase_database_url

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# API Keys
OPENAI_API_KEY=your_openai_api_key

# Client URL
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=10
JWT_EXPIRE=7d

# Node Environment
NODE_ENV=development
```

### Production (Set in Render Dashboard)
```bash
# Database (use Supabase pooler URL for IPv4 compatibility)
DATABASE_URL=your_production_database_url
SUPABASE_DATABASE_URL=your_production_database_url

# Authentication
JWT_SECRET=auto_generated_by_render
SESSION_SECRET=generate_secure_random_string

# API Keys
OPENAI_API_KEY=your_openai_api_key

# Client URLs - UPDATE THESE
CLIENT_URL=https://mucha.casa

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=10
JWT_EXPIRE=7d

# Node Environment
NODE_ENV=production
```

## Deployment Instructions

### Vercel (Frontend)
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Update or add:
   - `VITE_API_URL` = `https://mucha-casa-api.onrender.com/api` (or your custom API domain)
   - `VITE_GOOGLE_MAPS_API_KEY` = Your production Google Maps API key

### Render (Backend)
1. Go to your Render service dashboard
2. Navigate to Environment section
3. Update:
   - `CLIENT_URL` = `https://mucha.casa`
   - Keep all other variables as they are

### Domain Configuration

#### Frontend (Vercel)
1. Go to your Vercel project settings
2. Navigate to Domains
3. Add custom domain: `mucha.casa`
4. Add www subdomain: `www.mucha.casa`
5. Follow Vercel's DNS configuration instructions

#### Backend API (Optional - for api.mucha.casa)
1. In Render dashboard, go to Settings
2. Add custom domain: `api.mucha.casa`
3. Configure DNS records as instructed by Render

## DNS Configuration (Example for Cloudflare/Namecheap)

### For Frontend:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

### For Backend API (if using subdomain):
```
Type: CNAME
Name: api
Value: your-render-service.onrender.com
TTL: Auto
```

## Important Notes

1. **SSL Certificates**: Both Vercel and Render provide automatic SSL certificates for custom domains
2. **Propagation Time**: DNS changes can take up to 48 hours to propagate globally
3. **Testing**: Test thoroughly after domain setup to ensure all features work correctly
4. **Backup**: Keep the old domain URLs in comments until fully migrated