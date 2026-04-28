import { NeonGradientCard } from '@/components/ui/neon-gradient-card'
import Image from 'next/image'
import React from 'react'
import { ArrowRight } from 'lucide-react'

interface BlogCardInterface{
    title : string,
    description : string,
    image : string,
    date : string,
    readtime : string
    url : string,
    neonColors? : {firstColor: string, secondColor: string}
}

const BlogCard = ({ title, description, image, date, readtime, url, neonColors = {firstColor: "#ff1818", secondColor: "#2fff00"} } : BlogCardInterface) => {
  return (
    <NeonGradientCard className='w-fit h-full min-h-[520px] bg-gradient-to-br from-slate-900/80 to-black/80 text-white relative mx-auto cursor-pointer flex flex-col overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20' neonColors={neonColors} > 
        <div className='max-w-[250px] sm:max-w-[400px] w-full flex flex-col h-full relative' onClick={() => window.open(url, "_blank")}> 
          {/* Image Container with Enhanced Effects */}
          <div className='relative overflow-hidden h-48 group-hover:brightness-125 transition-all duration-500'>
            <Image 
              src={image} 
              alt={title} 
              width={400} 
              height={200} 
              className='rounded-t-xl w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' 
            />
            {/* Enhanced Gradient Overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-t-xl group-hover:from-black/60 transition-all duration-500'></div>
          </div>

          {/* Content Section */}
          <div className='flex flex-col flex-grow p-5 gap-3'>
            {/* Title with Gradient Hover Effect */}
            <div className='text-lg sm:text-xl font-bold leading-tight line-clamp-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-pink-400 transition-all duration-500'>
              {title}
            </div>

            {/* Description with improved readability */}
            <div className='text-xs sm:text-sm text-gray-300 max-h-20 overflow-hidden text-ellipsis line-clamp-3 flex-grow leading-relaxed group-hover:text-gray-200 transition-colors duration-300'>
              {description}
            </div>

            {/* Enhanced Divider */}
            <div className='h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-2 group-hover:via-pink-500/50 transition-all duration-500'></div>

            {/* Enhanced Footer Section */}
            <div className='flex items-center justify-between mt-auto'>
              <div className='flex flex-col gap-1 text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300'>
                <span className='flex items-center gap-1.5'>
                  <span className='text-cyan-400'>📅</span> {date}
                </span>
                <span className='flex items-center gap-1.5'>
                  <span className='text-pink-400'>⏱️</span> {readtime}
                </span>
              </div>
              
              {/* Animated Arrow Button */}
              <div className='p-2.5 rounded-lg bg-gradient-to-br from-cyan-500/10 to-pink-500/10 group-hover:from-cyan-500/30 group-hover:to-pink-500/30 transition-all duration-500 border border-cyan-500/20 group-hover:border-cyan-500/50'>
                <ArrowRight className='w-4 h-4 text-cyan-400 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-500' />
              </div>
            </div>
          </div>
        </div>
    </NeonGradientCard>
  )
}

export default BlogCard
