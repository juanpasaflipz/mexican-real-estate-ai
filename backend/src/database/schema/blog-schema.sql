-- Blog System Database Schema for Mexican Real Estate Platform
-- This schema supports AI-generated content from property data

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    title_es VARCHAR(500) NOT NULL, -- Spanish title
    summary TEXT,
    summary_es TEXT,
    content TEXT NOT NULL,
    content_es TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID, -- Will link to users table when created
    category VARCHAR(100) NOT NULL,
    tags TEXT[], -- Array of tags
    
    -- SEO fields
    meta_title VARCHAR(160),
    meta_description VARCHAR(320),
    canonical_url TEXT,
    
    -- Publishing info
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, published, archived
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- AI generation metadata
    generation_type VARCHAR(50), -- manual, ai_generated, ai_assisted
    data_sources JSONB, -- Which queries/data were used
    ai_model VARCHAR(50), -- gpt-4o, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES blog_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog post properties relationship (which properties are featured in a post)
CREATE TABLE IF NOT EXISTS blog_post_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    property_id UUID NOT NULL, -- References properties table
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog analytics events
CREATE TABLE IF NOT EXISTS blog_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- view, share, click_property, download_report
    user_id UUID, -- Optional, for logged-in users
    session_id VARCHAR(255),
    metadata JSONB, -- Additional event data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog content templates for AI generation
CREATE TABLE IF NOT EXISTS blog_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- market_analysis, comparison, guide, seasonal
    title_template TEXT NOT NULL,
    content_structure JSONB NOT NULL, -- JSON structure for content sections
    data_requirements JSONB, -- What data/queries are needed
    generation_frequency VARCHAR(50), -- daily, weekly, monthly, quarterly
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog generation jobs (for scheduling and tracking)
CREATE TABLE IF NOT EXISTS blog_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES blog_templates(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    scheduled_for TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    generated_post_id UUID REFERENCES blog_posts(id),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX idx_blog_analytics_post_id ON blog_analytics(blog_post_id);
CREATE INDEX idx_blog_analytics_created_at ON blog_analytics(created_at DESC);

-- Insert default categories
INSERT INTO blog_categories (name, name_es, slug, description) VALUES
('Market Analysis', 'Análisis de Mercado', 'analisis-mercado', 'Reportes y análisis del mercado inmobiliario'),
('Buying Guide', 'Guía de Compra', 'guia-compra', 'Consejos y guías para compradores'),
('Investment', 'Inversión', 'inversion', 'Estrategias y oportunidades de inversión'),
('Neighborhood Guide', 'Guía de Colonias', 'guia-colonias', 'Información sobre colonias y zonas'),
('Legal & Finance', 'Legal y Finanzas', 'legal-finanzas', 'Información legal y financiera'),
('Trends', 'Tendencias', 'tendencias', 'Tendencias del mercado inmobiliario')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog templates
INSERT INTO blog_templates (name, template_type, title_template, content_structure, data_requirements, generation_frequency) VALUES
(
    'Monthly Market Report',
    'market_analysis',
    'Reporte Mensual: Mercado Inmobiliario en {city} - {month} {year}',
    '{
        "sections": [
            {"type": "summary", "title": "Resumen Ejecutivo"},
            {"type": "price_trends", "title": "Tendencias de Precios"},
            {"type": "property_distribution", "title": "Distribución de Propiedades"},
            {"type": "top_neighborhoods", "title": "Colonias Más Activas"},
            {"type": "predictions", "title": "Predicciones"},
            {"type": "related_properties", "title": "Propiedades Destacadas"}
        ]
    }'::jsonb,
    '{
        "queries": [
            "average prices by property type and city",
            "property count by neighborhood",
            "price changes month over month",
            "most viewed properties"
        ]
    }'::jsonb,
    'monthly'
),
(
    'City Comparison Guide',
    'comparison',
    '{city1} vs {city2}: Guía Completa de Inversión Inmobiliaria',
    '{
        "sections": [
            {"type": "overview", "title": "Comparación General"},
            {"type": "price_comparison", "title": "Análisis de Precios"},
            {"type": "property_types", "title": "Tipos de Propiedades"},
            {"type": "roi_analysis", "title": "Retorno de Inversión"},
            {"type": "lifestyle_factors", "title": "Calidad de Vida"},
            {"type": "recommendations", "title": "Recomendaciones"}
        ]
    }'::jsonb,
    '{
        "queries": [
            "property prices by city",
            "property type distribution by city",
            "average size and features by city",
            "price per square meter comparison"
        ]
    }'::jsonb,
    'weekly'
)
ON CONFLICT DO NOTHING;