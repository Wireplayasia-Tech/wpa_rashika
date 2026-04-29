"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { X, Send, Upload, RefreshCw, Search } from "lucide-react";
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
];

export default function WPIModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"selection" | "chat">("selection");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [customGameName, setCustomGameName] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowGameDropdown(false);
      }
    };

    if (showGameDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showGameDropdown]);

  const handleSubmit = async () => {
    if (!selectedGame && !uploadedImage) return;
    if ((!inputValue.trim() && !uploadedImage) || isLoading) return;

    const userMessage: Message = {
      id: String(messages.length + 1),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      gameTitle: selectedGame || undefined,
      imageData: uploadedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue("");
    setUploadedImage(null);

    try {
      console.log("[v0] WPI: Sending request to /api/wpi");

      let screenshotData = uploadedImage;
      if (uploadedImage && !uploadedImage.includes(",")) {
        screenshotData = `data:image/jpeg;base64,${uploadedImage}`;
      }

      const response = await fetch("/api/wpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: inputValue.trim() || "Please analyze the uploaded screenshot.",
          game: selectedGame,
          screenshot: screenshotData,
          conversationHistory: messages,
        }),
      });

      console.log("[v0] WPI: API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[v0] WPI: API error data:", errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`);
      }

      const data = await response.json();
      console.log("[v0] WPI: API response received:", data);

      if (data.game && !selectedGame) {
        setSelectedGame(data.game);
      }

      const aiContent = data.error || data.response || "I couldn't generate a response.";
      console.log("[v0] WPI: AI content:", aiContent.substring(0, 100));
      
      const aiResponse: Message = {
        id: String(messages.length + 2),
        type: "ai",
        content: aiContent,
        timestamp: new Date(),
        gameTitle: data.game || selectedGame || undefined,
      };

      setMessages((prev) => [...prev, aiResponse]);
      console.log("[v0] WPI: Message added to chat");
    } catch (error) {
      console.error("[v0] WPI: Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      setMessages((prev) => [
        ...prev,
        {
          id: String(messages.length + 2),
          type: "ai",
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
          gameTitle: selectedGame || undefined,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Selection view
  if (step === "selection") {
    return (
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
        onClick={(e) => {
          // Only close if clicking directly on the backdrop, not on any child elements
          if (e.target === e.currentTarget) {
            console.log("[v0] Selection backdrop clicked, closing modal");
            onClose();
          }
        }}
      >
        <div 
          className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden" 
          onClick={(e) => {
            e.stopPropagation();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-6 border-b-2 border-cyan-500/20">
            <h2 className="text-2xl font-bold text-white">Gaming Assistant</h2>
            <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* Game Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Select a Game</h3>
              <div className="relative" ref={dropdownRef}>
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search or type a game..."
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  onFocus={() => setShowGameDropdown(true)}
                  className="w-full bg-gray-800 border-2 border-cyan-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />

                {showGameDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-gray-800 border-2 border-cyan-500/30 rounded-lg mt-2 max-h-48 overflow-y-auto z-10">
                    {GAMES.filter((game) =>
                      game.toLowerCase().includes(gameSearchQuery.toLowerCase())
                    ).map((game) => (
                      <button
                        key={game}
                        onClick={() => {
                          setSelectedGame(game);
                          setGameSearchQuery("");
                          setShowGameDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 text-white transition-colors"
                      >
                        {game}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedGame && (
                <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-between">
                  <span className="text-white">{selectedGame}</span>
                  <button onClick={() => setSelectedGame(null)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Custom Game */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Or Enter Custom Game</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter game name..."
                  value={customGameName}
                  onChange={(e) => setCustomGameName(e.target.value)}
                  className="flex-1 bg-gray-800 border-2 border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => {
                    if (customGameName.trim()) {
                      setSelectedGame(customGameName);
                      setCustomGameName("");
                    }
                  }}
                  disabled={!customGameName.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Upload Screenshot */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Upload Screenshot</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-800 border-2 border-dashed border-cyan-500/40 rounded-lg p-8 text-center hover:border-cyan-400/60 transition-colors"
              >
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Click to upload</p>
                <p className="text-gray-400 text-xs">PNG, JPG, GIF up to 10MB</p>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              {uploadedImage && (
                <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border-2 border-cyan-500/50">
                  <Image src={uploadedImage} alt="Uploaded" width={128} height={128} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t-2 border-cyan-500/20 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedGame || uploadedImage) {
                  setStep("chat");
                  if (!selectedGame && uploadedImage) {
                    setMessages([
                      {
                        id: "1",
                        type: "ai",
                        content: "I can see your screenshot! Tell me which game this is from or select one above.",
                        timestamp: new Date(),
                      },
                    ]);
                  } else if (selectedGame) {
                    setMessages([
                      {
                        id: "1",
                        type: "ai",
                        content: `Ready to help with **${selectedGame}**! Upload a screenshot or ask your question.`,
                        timestamp: new Date(),
                        gameTitle: selectedGame,
                      },
                    ]);
                  }
                }
              }}
              disabled={!selectedGame && !uploadedImage}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:from-cyan-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Proceed to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      onClick={(e) => {
        // Only close if clicking directly on the backdrop, not on any child elements
        if (e.target === e.currentTarget) {
          console.log("[v0] Backdrop clicked, closing modal");
          onClose();
        }
      }}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" 
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-cyan-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Gaming Assistant</h2>
            <p className="text-sm text-cyan-400">
              Game: <span className="font-semibold">{selectedGame}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Chat */}
        <WPIChat messages={messages} isLoading={isLoading} />

        {/* Input */}
        <div className="border-t-2 border-cyan-500/20 p-6 space-y-4">
          {uploadedImage && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-cyan-500/50">
              <Image src={uploadedImage} alt="Screenshot" width={96} height={96} className="w-full h-full object-cover" />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about strategies, tips, or upload a screenshot..."
              className="flex-1 bg-gray-800 border-2 border-cyan-500/30 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSubmit();
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-gray-800 border-2 border-cyan-500/30 rounded-lg hover:bg-gray-700 hover:border-cyan-400/60 transition-colors"
              title="Upload screenshot"
            >
              <Upload className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep("selection")}
              className="px-4 py-2 bg-gray-800 border-2 border-cyan-500/30 rounded-lg text-white hover:bg-gray-700 hover:border-cyan-400/60 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Change Game
            </button>
            <button
              onClick={handleSubmit}
              disabled={(!inputValue.trim() && !uploadedImage) || isLoading}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:from-cyan-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
