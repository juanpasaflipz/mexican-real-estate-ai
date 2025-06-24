import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from 'axios'
import BlogSchema from '../components/SEO/BlogSchema'
import SocialShare from '../components/Blog/SocialShare'
import RelatedPosts from '../components/Blog/RelatedPosts'
import PropertySearchLinks from '../components/Blog/PropertySearchLinks'

// Use the same API configuration as the rest of the app
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mexican-real-estate-ai.onrender.com/api' || '/api'

const BlogList = () => {
  console.log('BlogList component mounted')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    console.log('BlogList useEffect running')
    fetchPosts()
    fetchCategories()
  }, [selectedCategory])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        status: 'published',
        limit: 20,
        ...(selectedCategory && { category: selectedCategory })
      })
      
      const response = await fetch(`${API_BASE_URL}/blog/posts?${params}`)
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText)
        // For now, show the hardcoded posts if API fails
        setPosts([
          {
            id: '1',
            slug: 'analisis-mercado-inmobiliario-cdmx-2025',
            title_es: 'Análisis del Mercado Inmobiliario en Ciudad de México 2025',
            summary_es: 'Un análisis profundo del mercado inmobiliario en la Ciudad de México, incluyendo tendencias en Polanco, Roma Norte y Condesa.',
            category: 'market-insights',
            published_at: new Date().toISOString(),
            featured_image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=400&fit=crop'
          }
        ])
        return
      }
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      // Show at least one post so users know the blog exists
      setPosts([
        {
          id: '1',
          slug: 'analisis-mercado-inmobiliario-cdmx-2025',
          title_es: 'Análisis del Mercado Inmobiliario en Ciudad de México 2025',
          summary_es: 'Un análisis profundo del mercado inmobiliario en la Ciudad de México, incluyendo tendencias en Polanco, Roma Norte y Condesa.',
          category: 'market-insights',
          published_at: new Date().toISOString(),
          featured_image_url: 'https://source.unsplash.com/800x400/?mexico,real-estate'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/categories`)
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog Inmobiliario</h1>
      
      {/* Category Filter */}
      <div className="mb-8">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.slug}>
              {cat.name_es} ({cat.post_count})
            </option>
          ))}
        </select>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.title_es}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            )}
            <div className="p-6">
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-500">
                  {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: es }) : 'Borrador'}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-blue-600">{post.category}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                  {post.title_es}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.summary_es}
              </p>
              <Link
                to={`/blog/${post.slug}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Leer más →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay artículos publicados todavía.</p>
        </div>
      )}
    </div>
  )
}

const BlogPost = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/posts/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-center text-gray-500">Artículo no encontrado.</p>
        <Link to="/blog" className="block text-center mt-4 text-blue-600 hover:text-blue-700">
          ← Volver al blog
        </Link>
      </div>
    )
  }

  return (
    <>
      <BlogSchema post={post} />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/blog" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Volver al blog
        </Link>
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title_es}</h1>
        <div className="flex items-center text-gray-500">
          <span>
            {post.published_at ? format(new Date(post.published_at), 'dd MMMM yyyy', { locale: es }) : 'Borrador'}
          </span>
          <span className="mx-2">•</span>
          <span>{post.view_count} vistas</span>
        </div>
      </header>

      {post.featured_image_url && (
        <img
          src={post.featured_image_url}
          alt={post.title_es}
          className="w-full h-96 object-cover rounded-lg mb-8"
          loading="lazy"
        />
      )}

      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content_es }}
      />

      {/* Social Sharing */}
      <SocialShare 
        url={`https://mexican-real-estate-ai-jy2t.vercel.app/blog/${post.slug}`}
        title={post.title_es}
      />

      {/* Property Search Links */}
      <PropertySearchLinks post={post} />

      {/* Related Properties */}
      {post.related_properties && post.related_properties.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Propiedades Relacionadas</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {post.related_properties.map(property => (
              <div key={property.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                <p className="text-gray-600">{property.location}</p>
                <p className="text-xl font-bold text-blue-600 mt-2">
                  ${property.price} {property.currency}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Etiquetas:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Posts */}
      <RelatedPosts 
        currentPost={post.slug}
        category={post.category}
        tags={post.tags}
      />
    </article>
    </>
  )
}

export { BlogList, BlogPost }