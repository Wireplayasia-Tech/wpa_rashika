"use client";

import GradualSpacing from '@/components/ui/gradual-spacing';
import HyperText from '@/components/ui/hyper-text';
import Image from 'next/image';
import React from 'react'

const OurTeam = () => {
  const teamMembers = [
    {
       name : "BRS",
       image : "/team/brs.png",
       role: "Founder, CEO",
       color: "#8ea5ff",
    },
       {
        name : "Avinash S",
        image : "/team/avijpeg.jpeg",
        role: "Tech Lead &DevOps",
        color: "#FF0099",
       },
       {
        name : "Pawan Dwivedi",
        image : "/team/pawan.png",
        role: "Full Stack Engineer",
        color: "#9D00FF",
       },{
        name : "Rashika Chellamuthu",
        image : "/team/rashi.jpg.png",
        role: "Junior Front End", 
        color: "#099FFF",
       },{
        name : "Suraj Krishna",
        image : "/team/suraj.png",
        role: "Content Writer",
        color: "#37013A"
       },{
        name : "Gopinath G",
        image : "/team/gopi.png",
        role: "Social Media",
        color: "#FD1C03"
       }
  ];
  const TeamCard = ({name,role, image , color}:{
   name : string,
   image : string,
   role : string,
   color: string
  }) => {
      return (
        <div className='relative py-7 h-[100dvh]'>
            <div className='flex gap-3 absolute bottom-6 left-6 items-center text-white justify-center flex-col p-3' style={{
                backgroundColor: color
            }}>
                <div className="flex gap-3 text-4xl flex-wrap font-bold ">
                    {
                        name.split(" ").map((word, index) => (
                            <div key={index}>
                                <HyperText useInview text={word} duration={1000} />
                            </div>
                        ))
                    }
                </div>
                <GradualSpacing text={role} duration={1} className='flex-wrap' />
            </div>
            <Image src={image} alt={name} className='object-cover h-full md:float-start md:ml-24' width={500} height={500} />
        </div>
      )
  }
  return (
    <div className='bg-image1 bg-cover'>
        <p className="text-7xl h-[100dvh] flex items-center justify-center text-white font-bold text-navhover text-center">
            Our Builders
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-8 px-4 ">
            {teamMembers.map((member, index) => (
                <TeamCard key={index} name={member.name} role={member.role} color={member.color} image={member.image} />
            ))}
        </div>
    </div>
  )
}

export default OurTeam
