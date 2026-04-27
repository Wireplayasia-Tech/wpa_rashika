"use client";

import React from "react";
import { IconProps } from "./Navbar";
import { Instagram } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const Icons = {
    linkedin: () => (
      <svg xmlns="http://www.w3.org/2000/svg" height={24}
      width={24} viewBox="0 0 16 16">
        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
      </svg>
    ),
    medium: (props?: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={32}
        width={32}
        viewBox="0 0 16 16"
        {...props}
      >
        <path d="M9.025 8c0 2.485-2.02 4.5-4.513 4.5A4.506 4.506 0 0 1 0 8c0-2.486 2.02-4.5 4.512-4.5A4.506 4.506 0 0 1 9.025 8m4.95 0c0 2.34-1.01 4.236-2.256 4.236S9.463 10.339 9.463 8c0-2.34 1.01-4.236 2.256-4.236S13.975 5.661 13.975 8M16 8c0 2.096-.355 3.795-.794 3.795-.438 0-.793-1.7-.793-3.795 0-2.096.355-3.795.794-3.795.438 0 .793 1.699.793 3.795" />
      </svg>
    ),
    instagram: () => <Instagram fill="black" />,
    discord: (props?: IconProps) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={24}
        width={24}
        viewBox="0 0 16 16"
        {...props}
      >
        <title>Discord</title>
        <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
      </svg>
    ),
  };
  return (
    <div className="text-white h-full bg-black/20 flex justify-between bg-[left] bg-comtain px-5 py-8 gap-4 flex-col sm:flex-row">
      <div className="flex flex-col gap-5 md:w-1/3 font-semibold items-center justify-center">
        <div className="cursor-pointer">White Paper</div>
        <Link className="cursor-pointer" target="_blank" href={"https://www.linkedin.com/company/stealth-wpa/jobs/"}>Build with us(careers)</Link>
      </div>
      <div className="flex justify-center md:w-1/3 gap-3">
        <Button
          variant={"outline"}
          size={"icon"}
          disabled
          className="rounded-full"
        >
          {Icons.instagram()}
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full"
          onClick = {()=> window.open("https://www.linkedin.com/company/stealth-wpa","_blank")}
        >
          {Icons.linkedin()}
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full"
          onClick = {()=> window.open("https://wireplay.medium.com/","_blank")}
        >
          {Icons.medium()}
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled
          className="rounded-full"
        >
          {Icons.discord()}
        </Button>
      </div>

      <div className="cursor-pointer flex flex-col gap-2 font-semibold items-center justify-center md:w-1/3">
        Partners
        <Image
          src="/partnerLogo.png"
          alt="logo"
          className="w-16 h-16"
          draggable={false}
          width={24}
          height={24}
        />
      </div>
    </div>
  );
};

export default Footer;
