'use client'

import React, { useEffect, useState } from 'react'
import BlogCard from './_components/BlogCard'

interface Article {
  author: string
  categories: string[]
  content: string
  description: string
  enclosure: Record<string, unknown>
  guid: string
  link: string
  pubDate: string
  thumbnail: string | null
  title: string
}

const Blogs = () => {
  const mediumUrl = "https://medium.com/feed/@wireplay"

  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${mediumUrl}`)
      .then(res => res.json())
      .then(data => {
        const items = data.items as Article[]
        setArticles(items)
      })
  }, [])

  return (
    <div className="pb-24 pt-44 px-6">
      <div className="flex flex-wrap justify-center gap-8">
        <BlogCard 
          url="https://wireplay.medium.com/what-should-investors-know-about-investing-in-games-a-perspective-6ec15a388930" 
          title="What Should Investors Know About Investing in Games — A Perspective" 
          description="The gaming industry is no longer just a niche market for entertainment — it's a global powerhouse with substantial financial opportunities. With over 3.38 billion gamers worldwide as of 2024, projections estimate this number to reach 3.8 billion by 2030....." 
          image="/blogs/blog1.png" 
          date="26 Nov, 2024" 
          readtime="6 min"
          neonColors={{firstColor: "#ff1818", secondColor: "#2fff00"}}
        />
        <BlogCard 
          url="https://wireplay.medium.com/the-union-budget-moment-why-2026-is-year-zero-for-indian-gaming-71484a73d13b" 
          title="The 'Union Budget' Moment: Why 2026 is Year Zero for Indian Gaming" 
          description="2026 marks a transformative moment when India's gaming infrastructure, policy, audience, and business models aligned. Union Budget 2026-27 recognized gaming as part of the Orange Economy with ₹250 crore allocation for AVGC labs. Discover why this is the pivotal year for Indian gaming's evolution....." 
          image="/blogs/union-budget-2026.png" 
          date="17 Apr, 2026" 
          readtime="8 min"
          neonColors={{firstColor: "#00d4ff", secondColor: "#ff00ff"}}
        />
        <BlogCard 
          url="https://wireplay.medium.com/the-neptune-strategy-how-krafton-india-built-a-2-5b-dc87d0840a46" 
          title="The Neptune Strategy: How Krafton India Built a $2.5B Infrastructure" 
          description="In 2026, gaming growth is no longer about buying eyeballs through legacy ads—it's about Vertical AdTech middleware. Discover how Krafton transformed the gaming industry by building sophisticated data infrastructure that connects creators to revenue with surgical precision....." 
          image="/blogs/blog1.png" 
          date="09 Apr, 2026" 
          readtime="5 min"
          neonColors={{firstColor: "#ffaa00", secondColor: "#00ff88"}}
        />
      </div>
    </div>
  )
}

export default Blogs
