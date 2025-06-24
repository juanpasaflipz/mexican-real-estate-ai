import React from 'react'
import { Helmet } from 'react-helmet'

const BlogSchema = ({ post }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title_es,
    "alternativeHeadline": post.title,
    "image": post.featured_image_url,
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "author": {
      "@type": "Organization",
      "name": "Mexican Real Estate AI",
      "url": "https://mexican-real-estate-ai-jy2t.vercel.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mexican Real Estate AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mexican-real-estate-ai-jy2t.vercel.app/logo.png"
      }
    },
    "description": post.summary_es,
    "inLanguage": "es-MX",
    "keywords": post.tags ? post.tags.join(', ') : '',
    "articleSection": post.category,
    "url": `https://mexican-real-estate-ai-jy2t.vercel.app/blog/${post.slug}`
  }

  // Real Estate specific schema for property-related posts
  const realEstateSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Mexican Real Estate AI",
    "url": "https://mexican-real-estate-ai-jy2t.vercel.app",
    "areaServed": {
      "@type": "Country",
      "name": "Mexico"
    },
    "serviceType": "Real Estate Information",
    "knowsAbout": ["Mexican Real Estate", "Property Investment", "Real Estate Market Analysis"]
  }

  return (
    <Helmet>
      <title>{post.meta_title || post.title_es}</title>
      <meta name="description" content={post.meta_description || post.summary_es} />
      <meta property="og:title" content={post.title_es} />
      <meta property="og:description" content={post.summary_es} />
      <meta property="og:image" content={post.featured_image_url} />
      <meta property="og:url" content={`https://mexican-real-estate-ai-jy2t.vercel.app/blog/${post.slug}`} />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(realEstateSchema)}
      </script>
    </Helmet>
  )
}

export default BlogSchema