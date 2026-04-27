"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "../ui/lamp";
import CountdownTimer from "./Counter";

export function ComingSoon() {
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
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl leading-[100%] font-medium tracking-tight text-transparent md:text-7xl"
      >
        Coming <br /> Soon

      <CountdownTimer />
      </motion.h1>
    </LampContainer>
  );
}
