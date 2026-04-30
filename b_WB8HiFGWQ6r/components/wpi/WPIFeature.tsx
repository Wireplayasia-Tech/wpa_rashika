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
          WPA Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.id}>
              {feature.isActive ? (
                // Active card - full content
                <div
                  className={`h-80 transition-all duration-300 border-2 rounded-xl p-1 ${feature.isActive
                      ? "border-cyan-400/60"
                      : "border-gray-600/40"
                    }`}
                >
                  <NeonGradientCard
                    neonColors={feature.color}
                    className={`flex flex-col items-center justify-center cursor-pointer h-full ${feature.isActive ? "hover:scale-105" : ""
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
                      <span className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white text-sm font-semibold rounded-lg">
                        ✅ 👾 Ask me about anything
                      </span>
                    </div>
                  </NeonGradientCard>
                </div>
              ) : (
                // Inactive card - name and coming soon badge
                <div className="h-80 rounded-xl p-4 border-2 border-gray-600/40 bg-gray-900/40 flex flex-col items-center justify-center opacity-60">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-gray-400">
                      {feature.title}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && <WPIModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
