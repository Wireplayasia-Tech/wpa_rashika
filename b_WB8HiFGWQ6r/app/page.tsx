"use client";

import HyperText from "@/components/ui/hyper-text";
import { Separator } from "@/components/ui/separator";
import SparklesText from "@/components/ui/sparkles-text";
import Image from "next/image";
import { useEffect, useState } from "react";
import About from "../components/shared/(about)/page";

export default function Home() {
  const [i, setI] = useState(1);
  const text = ["Optimize", "Scale", "Dominate", "Strategize", "Own"];

  const [displayText, setDisplayText] = useState<JSX.Element>(
    <HyperText text={text[0]} className="text-2xl sm:text-3xl" />
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText(
        <HyperText
          text={text[i]}
          duration={1500}
          className="text-2xl sm:text-3xl"
        />,
      );
      setI((prevI) => (prevI >= text.length - 1 ? 0 : prevI + 1));
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const vision =
    "To redefine the gaming ecosystem by empowering creators, developers, and enthusiasts through an innovative platform where driven insights, community, and collaboration come together. At WPA, we envision a future where technology and creativity thrive in harmony, providing an all-in-one ecosystem that elevates gaming experiences and fuels growth across the industry.";
  const mission =
    "To empower creators, developers, and gaming enthusiasts by providing an all-in-one ecosystem where innovation, resources, and community converge. WPA is dedicated to driving growth, fostering creativity, and delivering transformative tools that elevate every aspect of the gaming experience. Together, we’re building a platform that fuels inspiration, connects passionate individuals, and sets new standards for the future of gaming.";
  return (
    <div className="font-[family-name:var(--font-geist-sans)] text-white">
      <div className="relative  overflow-hidden">
        <div className="text-5xl sm:text-7xl font-black w-full h-[100dvh] flex flex-col items-center justify-center relative z-10">
          <SparklesText
            text="Wireplay Asia"
            className="mb-7 text-center text-5xl sm:text-7xl "
          />
          <div className="w-full text-center">
            <div className="inline-flex items-center justify-center gap-0 text-2xl sm:text-3xl">
              <span
                style={{ fontFamily: "Calibri, sans-serif", fontWeight: "normal" }}
                className="whitespace-nowrap flex-shrink-0"
              >
                Entertain.Train.
              </span>
              <div className="w-[8rem] sm:w-[10rem] flex justify-start flex-shrink-0">
                {displayText}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 m-10 sm:p-5 p-2 flex flex-col rounded-md border items-center gap-7 bg-white/30 mb-40">
          <div className="text-4xl sm:text-5xl font-black text-navhover relative px-6 py-2 rounded-full w-fit flex justify-center bg-black/30">
            Our Vision
            <Image
              src={"/cardsBg.png"}
              alt=""
              width={500}
              height={200}
              className="absolute top-0 left-0 z-1 aspect-[3/1]"
            />
          </div>
          <Separator orientation="horizontal" />
          <div className="w-full">{vision}</div>
        </div>

        <div className="relative z-10 m-10 sm:p-5 p-2 flex flex-col-reverse rounded-md border items-center gap-7 bg-white/30 mb-40">
          <div className="w-full">{mission}</div>
          <Separator orientation="horizontal" />
          <div className="text-4xl sm:text-5xl font-black text-navhover relative py-2 sm:px-6 p-2 rounded-full w-fit flex justify-center bg-black/30">
            Our Mission
            <Image
              src={"/cardsBg.png"}
              alt=""
              width={500}
              height={200}
              className="absolute top-0 left-0 z-1 aspect-[3/1]"
            />
          </div>
        </div>

        <Image
          src={"/homeBg.png"}
          height={1080}
          width={1920}
          alt="Home"
          className="absolute top-0 left-0 object-cover z-0 min-h-[100dvh] rotate-180"
        />
      </div>
      <About />
    </div>
  );
}
