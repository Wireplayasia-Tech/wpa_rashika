"use client";
import React, { useEffect, useState } from 'react'
import BlogCard from './_components/BlogCard';

interface Article {
  author: string;
  categories: string[];
  content: string;
  description: string;
  enclosure: Record<string, unknown>;
  guid: string;
  link: string;
  pubDate: string;
  thumbnail: string | null;
  title: string;
}

const Blogs = () => {
  const mediumUrl = "https://medium.com/feed/@wireplay";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${mediumUrl}`)
            .then(res => res.json())
            .then(data => {
                const items = data.items as Article[];
                setArticles(items);
            });
    }, []);
  return (
    <div className='pb-24 pt-44 px-6'>
    <BlogCard url='https://wireplay.medium.com/what-should-investors-know-about-investing-in-games-a-perspective-6ec15a388930' title='What Should Investors Know About Investing in Games — A Perspective' description='The gaming industry is no longer just a niche market for entertainment — it’s a global powerhouse with substantial financial opportunities. With over 3.38 billion gamers worldwide as of 2024, projections estimate this number to reach 3.8 billion by 2030.....' image='/blogs/blog1.png' date='26 Nov, 2024' readtime = "6 min"/>
    </div>
  )
}

export default Blogs