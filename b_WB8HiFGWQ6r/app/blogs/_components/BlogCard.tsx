import { NeonGradientCard } from '@/components/ui/neon-gradient-card'
import Image from 'next/image'
import React from 'react'

interface BlogCardInterface{
    title : string,
    description : string,
    image : string,
    date : string,
    readtime : string
    url : string
}

const BlogCard = ({ title, description, image, date, readtime, url } : BlogCardInterface) => {
  return (
    <NeonGradientCard className='w-fit h-fit bg-white/20 text-white relative mx-auto cursor-pointer' neonColors={{firstColor: "#ff1818", secondColor: "#2fff00"}} > 
        <div className='max-w-[250px] sm:max-w-[400px]  w-full' onClick={() => window.open(url, "_blank")}> 
          <Image src={image} alt={title} width={400} height={200} className='rounded-t-xl' />
          <div className='p-3 text-lg sm:text-2xl font-bold'>{title}</div>
          <div className='p-3 max-h-[5em] whitespace-nowrap overflow-hidden text-ellipsis pb-7'>{description}</div>
          <div className='absolute bottom-2 right-2 text-xs flex gap-2'>
            <div>
                {date}
            </div>
            <div>
                {readtime}
            </div>
          </div>
        </div>
    </NeonGradientCard>
  )
}

export default BlogCard