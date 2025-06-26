# User Accounts System Planning Document

## Overview
This document outlines the comprehensive plan for implementing a multi-tier user account system for the Mexican Real Estate Platform, supporting different user roles with varying permissions and subscription levels.

## 1. User Roles & Permissions Matrix

### 1.1 Role Definitions

#### **Admin** (Super User)
- Full system access
- User management (create, edit, delete users)
- Property management (edit, delete any property)
- Subscription management
- System configuration
- Analytics dashboard access
- Content moderation
- Financial reports

#### **Regular User** (Property Seeker)
- Browse properties
- Save favorites
- Create saved searches with alerts
- Contact brokers
- View property history
- Basic account management
- Leave reviews/ratings for brokers

#### **Broker** (Property Lister)
Multiple tiers with different capabilities:

**Basic Broker (Free Tier)**
- List up to 5 properties
- Basic property analytics
- Contact management
- Response to inquiries
- Basic profile page

**Professional Broker (Tier 1 - $299 MXN/month)**
- List up to 25 properties
- Enhanced analytics
- Featured agent badge
- Priority in search results
- Custom profile URL
- Lead management tools
- Automated responses

**Premium Broker (Tier 2 - $599 MXN/month)**
- List up to 100 properties
- Featured properties (5/month)
- Top placement in search
- Advanced analytics & reports
- API access for bulk uploads
- Team sub-accounts (up to 3)
- Custom branding on listings

**Enterprise Broker (Tier 3 - $1,299 MXN/month)**
- Unlimited property listings
- Featured properties (20/month)
- Premium placement
- White-label options
- Unlimited team accounts
- Priority support
- Custom integrations
- Dedicated account manager

### 1.2 Permissions Table

| Feature | Admin | Regular User | Basic Broker | Professional | Premium | Enterprise |
|---------|-------|--------------|--------------|--------------|---------|------------|
| Browse Properties | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Save Favorites | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contact Brokers | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| List Properties | ✓ | ✗ | 5 | 25 | 100 | Unlimited |
| Featured Listings | ✓ | ✗ | ✗ | ✗ | 5/mo | 20/mo |
| Analytics Access | Full | ✗ | Basic | Enhanced | Advanced | Full |
| API Access | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Team Accounts | ✓ | ✗ | ✗ | ✗ | 3 | Unlimited |
| Custom Branding | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Priority Support | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |

## 2. Database Schema Design

### 2.1 Core Tables

```sql
-- Users table (extends existing auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'regular_user',
    status user_status NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'regular_user', 'broker');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- Broker profiles
CREATE TABLE broker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT,
    license_number TEXT,
    bio TEXT,
    specialties TEXT[],
    languages TEXT[],
    service_areas TEXT[],
    years_experience INTEGER,
    total_sales INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    profile_slug TEXT UNIQUE,
    website_url TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB NOT NULL,
    limits JSONB NOT NULL, -- {properties: 25, featured: 5, team_members: 3}
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    stripe_subscription_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');

-- Team members (for broker teams)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role NOT NULL DEFAULT 'agent',
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(broker_id, member_id)
);

CREATE TYPE team_role AS ENUM ('admin', 'agent', 'assistant');

-- Property ownership
CREATE TABLE property_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES users(id),
    status listing_status NOT NULL DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE listing_status AS ENUM ('draft', 'active', 'pending', 'sold', 'expired', 'archived');

-- Broker reviews
CREATE TABLE broker_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_transaction BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(broker_id, reviewer_id, property_id)
);

-- Usage tracking
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- 'property_listing', 'featured_listing', 'api_call'
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    count INTEGER DEFAULT 1,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- Users can read their own data
CREATE POLICY users_read_own ON users FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY users_admin_read ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Brokers can read their team members
CREATE POLICY team_members_read ON team_members FOR SELECT USING (
    broker_id = auth.uid() OR member_id = auth.uid()
);

-- Property listings can be managed by owner
CREATE POLICY property_listings_manage ON property_listings 
    FOR ALL USING (broker_id = auth.uid());
```

## 3. Authentication & Authorization Flow

### 3.1 Registration Flow

1. **User Registration**
   - Email/password or OAuth (Google, Facebook)
   - Email verification required
   - Default role: regular_user

2. **Broker Registration**
   - Requires additional information:
     - Company name
     - License number
     - Phone verification
   - Admin approval for verified status
   - Automatic free tier subscription

3. **Admin Creation**
   - Only by existing admins
   - Requires 2FA setup

### 3.2 Authentication Middleware

```javascript
// middleware/auth.js
const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    try {
        const user = await verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

const checkSubscriptionLimit = (resource) => {
    return async (req, res, next) => {
        const usage = await getResourceUsage(req.user.id, resource);
        const limit = await getSubscriptionLimit(req.user.id, resource);
        
        if (usage >= limit) {
            return res.status(403).json({ 
                error: 'Subscription limit reached',
                upgrade_url: '/pricing'
            });
        }
        next();
    };
};
```

## 4. Broker-Specific Features

### 4.1 Property Upload System

**Features:**
- Bulk upload via CSV/Excel
- API integration for MLS sync
- Image upload with compression
- Auto-save drafts
- Property templates

**Upload Limits:**
- Basic: 5 properties, 5 images each
- Professional: 25 properties, 10 images each
- Premium: 100 properties, 20 images each
- Enterprise: Unlimited, 50 images each

### 4.2 Featured Listings

**How it works:**
- Credits allocated monthly based on tier
- Credits don't roll over
- Featured properties get:
  - Top placement in search results
  - Homepage carousel inclusion
  - "Featured" badge
  - Email blast inclusion

### 4.3 Analytics Dashboard

**Metrics Available:**
- Views per property
- Contact requests
- Conversion rates
- Market comparison
- ROI tracking
- Lead source analysis

## 5. Admin Dashboard Features

### 5.1 User Management
- User search and filtering
- Role assignment
- Account suspension/activation
- Subscription override
- Activity logs

### 5.2 Content Moderation
- Property approval queue
- Reported listings
- Review moderation
- Automated quality checks

### 5.3 Financial Dashboard
- Revenue tracking
- Subscription metrics
- Churn analysis
- Payment history
- Invoice generation

## 6. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema setup
- [ ] Basic authentication (Supabase Auth)
- [ ] User registration/login
- [ ] Role-based middleware

### Phase 2: Broker Features (Week 3-4)
- [ ] Broker profile pages
- [ ] Property upload interface
- [ ] Subscription plans setup
- [ ] Usage tracking

### Phase 3: Subscription System (Week 5-6)
- [ ] Payment integration (Stripe)
- [ ] Subscription management
- [ ] Usage limits enforcement
- [ ] Billing dashboard

### Phase 4: Advanced Features (Week 7-8)
- [ ] Team management
- [ ] Analytics dashboard
- [ ] API access
- [ ] Featured listings

### Phase 5: Admin Tools (Week 9-10)
- [ ] Admin dashboard
- [ ] User management
- [ ] Content moderation
- [ ] Financial reports

## 7. Technical Considerations

### 7.1 Security
- JWT tokens with refresh mechanism
- Rate limiting per user tier
- 2FA for admins and brokers
- Audit logs for sensitive actions
- GDPR compliance

### 7.2 Performance
- Redis caching for user sessions
- Lazy loading for analytics
- CDN for profile images
- Database indexing on user_id, role

### 7.3 Scalability
- Microservice architecture ready
- Queue system for bulk uploads
- Horizontal scaling capability
- Multi-tenant architecture

### 7.4 Integration Points
- Stripe for payments
- SendGrid for emails
- Twilio for SMS verification
- Google Analytics for tracking
- MLS APIs for property sync

## 8. UI/UX Considerations

### 8.1 User Dashboard Layouts
- **Regular User**: Saved properties, searches, contact history
- **Broker**: Properties, leads, analytics, billing
- **Admin**: System overview, user management, reports

### 8.2 Mobile Responsiveness
- Progressive web app
- Native app considerations
- Touch-friendly interfaces
- Offline capability for brokers

### 8.3 Onboarding Flow
- Guided setup for brokers
- Feature discovery
- Sample data for testing
- Help documentation

## 9. Pricing Strategy

### 9.1 Competitive Analysis
- Similar to Inmuebles24, Vivanuncios
- Lower than Redfin Premier
- Feature parity with Zillow Premier Agent

### 9.2 Promotion Strategy
- 30-day free trial for all broker tiers
- Annual discount (2 months free)
- Referral program
- Volume discounts for agencies

## 10. Success Metrics

### 10.1 KPIs
- User acquisition rate
- Broker conversion rate
- Subscription retention
- Average revenue per user (ARPU)
- Property listing growth
- User engagement metrics

### 10.2 Monitoring
- Real-time dashboards
- Weekly reports
- A/B testing framework
- User feedback loops

## Next Steps

1. Review and approve this plan
2. Set up development environment
3. Create detailed API specifications
4. Design UI mockups
5. Begin Phase 1 implementation

## Questions to Address

1. Payment processor preference (Stripe, PayPal, Conekta)?
2. MLS integration requirements?
3. Specific compliance requirements for Mexico?
4. White-label needs for enterprise?
5. API rate limits and pricing?