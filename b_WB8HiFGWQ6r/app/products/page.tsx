import TextPages from '@/components/shared/TextPages'
import WPIFeature from '@/components/wpi/WPIFeature'
import React from 'react'

const Products = () => {
  return (
    <>
      <TextPages text={
        <div className='leading-[56px]'>
        Build in <br /> Progress
        </div>
      } />
      <WPIFeature />
    </>
  )
}

export default Products
