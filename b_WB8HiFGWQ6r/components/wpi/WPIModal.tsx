"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Upload, RefreshCw, ArrowRight } from "lucide-react";
import GameSelector from "./GameSelector";
import WPIChat from "./WPIChat";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  gameTitle?: string;
  imageData?: string;
}

const GAMES = [
  "GTA V",
  "PUBG",
  "Call of Duty",
  "Valorant",
  "Fortnite",
  "Minecraft",
  "Apex Legends",
  "Elden Ring",
  "FIFA",
  "NFS Most Wanted",
  "CS:GO",
  "League of Legends",
  "Dota 2",
  "Red Dead Redemption 2",
  "Assassin's Creed",
  "Cyberpunk 2077",
  "God of War",
  "Spider-Man",
  "Rocket League",
  "Clash of Clans",
  "Others",
];

export default function WPIModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"game" | "chat">("game");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGameSelect = (game: string) => {
    setSelectedGame(game);
    setStep("chat");
    // Add initial message
    setMessages([
      {
        id: "1",
        type: "ai",
        content: `Great! I'm ready to help you with **${game}**. Feel free to ask me anything about strategies, missions, shortcuts, or how to overcome challenges!`,
        timestamp: new Date(),
        gameTitle: game,
      },
    ]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectGameFromText = (text: string): string | null => {
    const gameLower = text.toLowerCase();
    for (const game of GAMES) {
      if (gameLower.includes(game.toLowerCase())) {
        return game;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() && !uploadedImage) return;

    const detectedGame = detectGameFromText(inputValue);
    const gameToUse = selectedGame || detectedGame;

    if (!gameToUse && inputValue.trim()) {
      // Non-gaming question
      if (!inputValue.toLowerCase().includes("game")) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(messages.length + 1),
            type: "user",
            content: inputValue,
            timestamp: new Date(),
          },
          {
            id: String(messages.length + 2),
            type: "ai",
            content:
              "Please ask questions related to games only. I'm here to help with gaming strategies, missions, tips, and tricks!",
            timestamp: new Date(),
          },
        ]);
        setInputValue("");
        setUploadedImage(null);
        return;
      }
    }

    // Add user message
    const userMessage: Message = {
      id: String(messages.length + 1),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      gameTitle: gameToUse,
      imageData: uploadedImage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setUploadedImage(null);
    setIsLoading(true);

    // Simulate AI response (in production, this would call an API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: String(messages.length + 2),
        type: "ai",
        content: generateAIResponse(inputValue, gameToUse, uploadedImage),
        timestamp: new Date(),
        gameTitle: gameToUse,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (
    question: string,
    game: string | null,
    hasImage: boolean
  ): string => {
    if (hasImage && question) {
      return `I can see your screenshot from **${game}**. Based on your image and question "${question}", here are my recommendations...`;
    } else if (hasImage) {
      return `I see you've shared a screenshot from **${game}**. I can analyze this and provide tips to help you progress!`;
    } else if (game) {
      return `Great question about **${game}**! Based on what you asked, here are some helpful strategies and tips...`;
    }
    return "I'm here to help with your gaming questions!";
  };

  const handleChangeGame = () => {
    setStep("game");
    setMessages([]);
  };

  const handleAskAnother = () => {
    setInputValue("");
    setUploadedImage(null);
  };

  if (step === "game") {
    return <GameSelector games={GAMES} onSelectGame={handleGameSelect} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Wireplay Interactive
            </h2>
            <p className="text-sm text-cyan-400">
              Currently helping with: <span className="font-semibold">{selectedGame}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Chat Area */}
        <WPIChat messages={messages} isLoading={isLoading} />

        {/* Input Area */}
        <div className="border-t border-cyan-500/20 p-6 space-y-4">
          {uploadedImage && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-cyan-500/50">
              <img
                src={uploadedImage}
                alt="Uploaded screenshot"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-1 right-1 bg-red-500 rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about the game… strategies, missions, shortcuts…"
              className="flex-1 bg-gray-800 border border-cyan-500/30 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSubmit();
                }
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-gray-800 border border-cyan-500/30 rounded-lg hover:bg-gray-700 transition-colors"
              title="Upload screenshot"
            >
              <Upload className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleChangeGame}
              className="px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Change Game
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!inputValue.trim() && !uploadedImage) || isLoading}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:from-cyan-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "Thinking..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
