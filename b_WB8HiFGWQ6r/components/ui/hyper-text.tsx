"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface HyperTextProps {
  text: string;
  duration?: number;
  framerProps?: Variants;
  className?: string;
  animateOnLoad?: boolean;
  useInview?: boolean;
  needWarp?: boolean;
}

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

export default function HyperText({
  text,
  duration = 800,
  framerProps = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 3 },
  },
  className,
  needWarp = false,
  animateOnLoad = true,
  useInview = false,
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState<string[]>([]);
  const [trigger, setTrigger] = useState(false);
  const interations = useRef(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: false });
  const isFirstRender = useRef(true);


  const triggerAnimation = () => {
    interations.current = 0;
    setTrigger(true);
  };


  useEffect(() => {
    setDisplayText(text.split(""));
    triggerAnimation();
  }, [text]);

  useEffect(() => {
    if (useInview && inView) {
      triggerAnimation();
    }
  }, [inView]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!animateOnLoad && isFirstRender.current) {
          clearInterval(interval);
          isFirstRender.current = false;
          return;
        }
        if (interations.current < text.length) {
          setDisplayText((t) =>
            t.map((l, i) =>
              l === " "
                ? l
                : i <= interations.current
                  ? text[i]
                  : alphabets[getRandomInt(26)],
            ),
          );
          interations.current = interations.current + 0.1;
        } else {
          setTrigger(false);
          clearInterval(interval);
        }
      },
      duration / (text.length * 10),
    );
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [text, duration, trigger, animateOnLoad]);

  return (
    <div
      className={`overflow-hidden py-2 flex cursor-default scale-100` + (needWarp ? " flex-wrap" : "")}
      onMouseEnter={triggerAnimation}
      ref={ref}
    >
      <AnimatePresence mode="sync">
        {displayText.map((letter, i) => (
          <motion.h1
            key={i}
            className={cn("font-mono", letter === " " ? "w-3" : "", className)}
            {...framerProps}
          >
            {letter.toUpperCase()}
          </motion.h1>
        ))}
      </AnimatePresence>
    </div>
  );
}
