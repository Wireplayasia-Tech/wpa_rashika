'use client'

import React, { useEffect, useState } from 'react'
import BlogCard from './_components/BlogCard'

interface BlogArticle {
  title: string
  description: string
  link?: string
  url?: string
  pubDate?: string
  date?: string
  thumbnail?: string
  image?: string
  readtime?: string
  neonColors?: { firstColor: string; secondColor: string }
}

interface RSSItem {
  title: string
  description?: string
  link?: string
  url?: string
  pubDate?: string
  date?: string
  thumbnail?: string
  image?: string
  readtime?: string
  neonColors?: { firstColor: string; secondColor: string }
}

interface FallbackArticle {
  url?: string
  link?: string
  title: string
  description: string
  image?: string
  thumbnail?: string
  date?: string
  pubDate?: string
  readtime?: string
  neonColors?: { firstColor: string; secondColor: string }
}

type Article = BlogArticle | RSSItem | FallbackArticle

const Blogs = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mediumUrl = "https://medium.com/feed/@wireplay"

  useEffect(() => {
    const fetchMediumArticles = async () => {
      try {
        setLoading(true)
        // Try RSS2JSON API
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(mediumUrl)}`, {
          headers: {
            'Accept': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.items && Array.isArray(data.items)) {
          const fetchedArticles = data.items.slice(0, 4).map((item: RSSItem) => {
            // Extract image from description if available, otherwise use a placeholder
            let imageUrl = '/default-blog.png'
            if (item.thumbnail) {
              imageUrl = item.thumbnail
            } else if (item.description && item.description.includes('<img')) {
              const imgMatch = item.description.match(/<img[^>]+src="([^">]+)/)
              if (imgMatch && imgMatch[1]) {
                imageUrl = imgMatch[1]
              }
            }
            
            return {
              title: item.title,
              description: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '......' || 'No description',
              link: item.link,
              pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              thumbnail: imageUrl
            }
          })
          setArticles(fetchedArticles)
        }
        setError(null)
      } catch (err) {
        console.error('Failed to fetch Medium articles:', err)
        setError('Unable to load Medium articles. Showing featured posts.')
        // Fall back to hardcoded articles on error
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchMediumArticles()
  }, [])

  // Fallback hardcoded articles if fetch fails
  const fallbackArticles = [
    {
      url: "https://wireplay.medium.com/what-should-investors-know-about-investing-in-games-a-perspective-6ec15a388930",
      title: "What Should Investors Know About Investing in Games — A Perspective",
      description: "The gaming industry is no longer just a niche market for entertainment — it's a global powerhouse with substantial financial opportunities. With over 3.38 billion gamers worldwide as of 2024...",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ff1818' width='400' height='300'/%3E%3C/svg%3E",
      date: "26 Nov, 2024",
      readtime: "6 min",
      neonColors: { firstColor: "#ff1818", secondColor: "#2fff00" }
    },
    {
      url: "https://wireplay.medium.com/the-union-budget-moment-why-2026-is-year-zero-for-indian-gaming-71484a73d13b",
      title: "The 'Union Budget' Moment: Why 2026 is Year Zero for Indian Gaming",
      description: "2026 marks a transformative moment when India's gaming infrastructure, policy, audience, and business models aligned. Union Budget 2026-27 recognized gaming as part of the Orange Economy...",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2300d4ff' width='400' height='300'/%3E%3C/svg%3E",
      date: "17 Apr, 2026",
      readtime: "8 min",
      neonColors: { firstColor: "#00d4ff", secondColor: "#ff00ff" }
    },
    {
      url: "https://wireplay.medium.com/the-neptune-strategy-how-krafton-india-built-a-2-5b-dc87d0840a46",
      title: "The Neptune Strategy: How Krafton India Built a $2.5B Infrastructure",
      description: "In 2026, gaming growth is no longer about buying eyeballs through legacy ads—it's about Vertical AdTech middleware. Discover how Krafton transformed the gaming industry...",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ffaa00' width='400' height='300'/%3E%3C/svg%3E",
      date: "09 Apr, 2026",
      readtime: "5 min",
      neonColors: { firstColor: "#ffaa00", secondColor: "#00ff88" }
    },
    {
      url: "https://wireplay.medium.com/the-death-of-saas-seats-how-the-2-5t-inference-economy-is-rewriting-software-economics-e5f689cafb86",
      title: "The Death of SaaS Seats: How the 2.5T Inference Economy is Rewriting Software Economics",
      description: "The software economics landscape is undergoing a fundamental transformation. As inference costs plummet and AI becomes ubiquitous, the traditional seat-based SaaS model is becoming obsolete...",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ff006e' width='400' height='300'/%3E%3C/svg%3E",
      date: "15 Jun, 2026",
      readtime: "7 min",
      neonColors: { firstColor: "#ff006e", secondColor: "#00d9ff" }
    }
  ]

  // Use fetched articles if available, otherwise use fallback
  const displayArticles = articles.length > 0 ? articles : fallbackArticles

  return (
    <div className="pb-24 pt-44 px-6">
      {error && <div className="text-center text-gray-400 mb-4">{error}</div>}
      {loading && <div className="text-center text-gray-400">Loading articles...</div>}
      <div className="flex flex-wrap justify-center gap-8 items-stretch">
        {displayArticles.length > 0 ? (
          displayArticles.map((article: Article, index: number) => (
            <BlogCard
              key={index}
              url={(article.url || article.link) as string}
              title={article.title || ''}
              description={article.description || ''}
              image={(article.image || article.thumbnail) as string}
              date={(article.date || article.pubDate) as string}
              readtime={(article.readtime || '5 min') as string}
              neonColors={(article.neonColors || { firstColor: "#00d4ff", secondColor: "#ff00ff" })}
            />
          ))
        ) : (
          !loading && <div className="text-center text-gray-400">No articles found</div>
        )}
      </div>
    </div>
  )
}

export default Blogs
