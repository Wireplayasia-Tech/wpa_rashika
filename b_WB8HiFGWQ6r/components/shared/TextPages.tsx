"use client";

import React, { ReactNode } from 'react'
import { LampContainer } from '../ui/lamp'
import { motion } from "framer-motion";

const TextPages = ({text} : {
    text : ReactNode
}) => {
  return (
    <LampContainer>
    <motion.h1
      initial={{ opacity: 0.6, y: 50 }}
      whileInView={{ opacity: 1, y: -50 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
      className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
    >
      {text}
    </motion.h1>
  </LampContainer>
  )
}

export default TextPages