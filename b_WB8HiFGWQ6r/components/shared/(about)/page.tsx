import Image from "next/image";

export default function About() {
  const aboutUs = [
    "A next-generation platform driven by the power of passion for innovation. Dedicated to advancing the gaming ecosystem with powerful resources, and a vibrant community. We're here to support creators, developers, and enthusiasts in their journey to elevate the gaming experience.",
    "At WPA, we believe that gaming is more than just a pastime but it's a dynamic, evolving world that thrives on innovation and connection. Our platform brings together tools designed to enhance every aspect of the gaming journey, all crafted to provide gamers, developers, and creators with the resources and inspiration they need to succeed.",
    "Each element of WPA is built to empower our users, creating an interconnected ecosystem that fosters creativity, collaboration, and growth. Whether you're here to leverage our solutions, explore the latest gaming resources, or connect with other passionate gamers, WPA is your partner in navigating and shaping the future of gaming.",
  ];
  return (
    <div
      className="font-[family-name:var(--font-geist-sans)] overflow-hidden dark text-white h-full py-4"
      id="aboutus"
    >
      <div className="flex items-center justify-center relative z-10 py-10">
        <div className="relative z-10 p-10 bg-black/40 rounded-lg">
          <div className="text-4xl sm:text-7xl  font-black bg-white/30 rounded-full w-fit mx-auto p-3">
            About Us
          </div>
          {aboutUs.map((item, index) => {
            return (
              <p className="max-w-[780px] my-3" key={index}>
                {item}
              </p>
            );
          })}
        </div>
        <Image
          src="/AboutBg.png"
          alt="About Bg"
          height={1080}
          width={1920}
          className="absolute top-0 left-0 object-cover z-1 h-[100dvh] overflow-hidden"
        />
      </div>
    </div>
  );
}
