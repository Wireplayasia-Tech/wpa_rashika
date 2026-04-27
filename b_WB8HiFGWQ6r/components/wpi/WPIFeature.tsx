"use client";

import React, { useState } from "react";
import { NeonGradientCard } from "../ui/neon-gradient-card";
import WPIModal from "./WPIModal";

export default function WPIFeature() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    {
      id: "wpi",
      title: "Wireplay Interactive (WPI)",
      description: "AI Gaming Assistant",
      isActive: true,
      color: { firstColor: "#00D9FF", secondColor: "#00FFA3" },
    },
    {
      id: "strategy",
      title: "Strategy Wars",
      description: "Coming Soon",
      isActive: false,
      color: { firstColor: "#FF006E", secondColor: "#FB5607" },
    },
    {
      id: "quests",
      title: "Quests",
      description: "Coming Soon",
      isActive: false,
      color: { firstColor: "#8338EC", secondColor: "#3A86FF" },
    },
  ];

  return (
    <div className="w-full py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
          AI Gaming Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`h-80 transition-all duration-300 ${
                !feature.isActive ? "opacity-50 blur-sm pointer-events-none" : ""
              }`}
            >
              <NeonGradientCard
                neonColors={feature.color}
                className={`flex flex-col items-center justify-center cursor-pointer h-full ${
                  feature.isActive ? "hover:scale-105" : ""
                } transition-transform duration-300`}
                onClick={() => feature.isActive && setIsModalOpen(true)}
              >
                <div className="text-center p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  {feature.isActive && (
                    <span className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white text-sm font-semibold rounded-lg">
                      ✅ Active
                    </span>
                  )}
                  {!feature.isActive && (
                    <span className="inline-block mt-4 px-4 py-2 bg-gray-600 text-gray-300 text-sm font-semibold rounded-lg">
                      🔒 Disabled
                    </span>
                  )}
                </div>
              </NeonGradientCard>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && <WPIModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
