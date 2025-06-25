import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const RelatedPosts = ({ currentPost, category, tags }) => {
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

  useEffect(() => {
    fetchRelatedPosts()
  }, [currentPost])

  const fetchRelatedPosts = async () => {
    try {
      // First try to get posts from the same category
      const response = await fetch(`${API_BASE_URL}/blog/posts?status=published&category=${category}&limit=4`)
      const data = await response.json()
      
      // Filter out the current post and limit to 3
      const posts = data.posts || []
      if (Array.isArray(posts)) {
        const filtered = posts
          .filter(post => post && post.slug !== currentPost)
          .slice(0, 3)
        setRelatedPosts(filtered)
      } else {
        setRelatedPosts([])
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || relatedPosts.length === 0) return null

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículos Relacionados</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.isArray(relatedPosts) && relatedPosts.map(post => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {post.featured_image_url && (
              <Link to={`/blog/${post.slug}`}>
                <img
                  src={post.featured_image_url}
                  alt={post.title_es}
                  className="w-full h-40 object-cover hover:opacity-90 transition"
                  loading="lazy"
                />
              </Link>
            )}
            <div className="p-4">
              <div className="text-sm text-gray-500 mb-2">
                {format(new Date(post.published_at), 'dd MMM yyyy', { locale: es })}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                  {post.title_es}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {post.summary_es}
              </p>
              <Link
                to={`/blog/${post.slug}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
              >
                Leer más →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default RelatedPosts