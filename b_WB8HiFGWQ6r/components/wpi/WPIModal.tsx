"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [showMismatchWarning, setShowMismatchWarning] = useState(false);
  const [detectedGameFromQuestion, setDetectedGameFromQuestion] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredGames = gameSearchQuery.trim()
    ? GAMES.filter((game) =>
        game.toLowerCase().includes(gameSearchQuery.toLowerCase())
      )
    : GAMES;

  const handleGameSelect = (game: string) => {
    setSelectedGame(game);
    setCustomGameName("");
    setStep("chat");
    setShowGameDropdown(false);
    setMessages([
      {
        id: "1",
        type: "ai",
        content: `Great! I'm ready to help you with **${game}**. You can now ask me questions, upload a screenshot, or both to get detailed gaming assistance!`,
        timestamp: new Date(),
        gameTitle: game,
      },
    ]);
  };

  const handleOthersGame = () => {
    if (customGameName.trim()) {
      setSelectedGame(customGameName);
      setStep("chat");
      setShowGameDropdown(false);
      setMessages([
        {
          id: "1",
          type: "ai",
          content: `Awesome! I'm ready to help you with **${customGameName}**. Ask me anything about strategies, missions, shortcuts, or tips!`,
          timestamp: new Date(),
          gameTitle: customGameName,
        },
      ]);
    }
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

  const isGamingQuestion = (question: string): boolean => {
    const nonGamingKeywords = [
      "stock market", "finance", "mortgage", "investment", "crypto", "bitcoin",
      "political", "election", "government", "weather", "recipe", "cooking",
      "medical", "doctor", "disease", "legal advice", "tax", "essay", "homework"
    ];

    const questionLower = question.toLowerCase();
    
    // Check for explicit non-gaming keywords
    for (const keyword of nonGamingKeywords) {
      if (questionLower.includes(keyword)) {
        return false;
      }
    }

    // If a game is selected, assume the question is about that game unless proven otherwise
    // This is reasonable because we're in the WPI gaming context
    return true;
  };

  const handleSubmit = async () => {
    if (!gameToUse && !uploadedImage) {
      console.log("[v0] WPI: No game or screenshot provided");
      return;
    }

    if ((!inputValue.trim() && !uploadedImage) || isLoading) {
      console.log("[v0] WPI: Input validation failed");
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      id: String(messages.length + 1),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      gameTitle: gameToUse,
      imageData: uploadedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue("");
    setUploadedImage(null);

    try {
      console.log("[v0] WPI: Sending request to /api/wpi", { game: gameToUse, questionLength: inputValue.length, hasScreenshot: !!uploadedImage, messagesCount: messages.length });
      
      // Prepare screenshot data
      let screenshotData = uploadedImage;
      if (uploadedImage && !uploadedImage.includes(',')) {
        // If it's already base64 without data URL, add the prefix
        screenshotData = `data:image/jpeg;base64,${uploadedImage}`;
      }

      const response = await fetch('/api/wpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputValue.trim() || "Please analyze the uploaded screenshot.",
          game: gameToUse,
          screenshot: screenshotData,
          conversationHistory: messages, // Pass full conversation history for context
        }),
      });

      console.log("[v0] WPI: API response status:", response.status);

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("[v0] WPI: API error response:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          console.error("[v0] WPI: Could not parse error response");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("[v0] WPI: API response received successfully");

      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from server');
      }

      // Update game name if API detected one
      if (data.game && !gameToUse) {
        console.log("[v0] WPI: Updating game from API detection:", data.game);
        setSelectedGame(data.game);
      }

      // Create AI response message
      let aiContent = "I couldn't generate a response. Please try again.";
      if (data.error) {
        console.log("[v0] WPI: API returned error:", data.error);
        aiContent = data.error;
      } else if (data.response) {
        console.log("[v0] WPI: Using API response");
        aiContent = data.response;
      }

      const aiResponse: Message = {
        id: String(messages.length + 2),
        type: "ai",
        content: aiContent,
        timestamp: new Date(),
        gameTitle: data.game || gameToUse,
      };

      console.log("[v0] WPI: Adding AI response to messages");
      setMessages((prev) => {
        const updated = [...prev, aiResponse];
        console.log("[v0] WPI: Messages updated, count:", updated.length);
        return updated;
      });
    } catch (error) {
      console.error("[v0] WPI: Error in handleSubmit:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get gaming assistance. Please make sure your Claude API key is configured.';
      const aiResponse: Message = {
        id: String(messages.length + 2),
        type: "ai",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
        gameTitle: gameToUse,
      };
      console.log("[v0] WPI: Adding error message to chat");
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      console.log("[v0] WPI: Setting isLoading to false");
      setIsLoading(false);
    }
  };

    const questionText = inputValue;
    const screenshotData = uploadedImage;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setUploadedImage(null);
    setIsLoading(true);

    // Call Claude API for gaming assistance
    try {
      console.log("[v0] WPI: Sending request to /api/wpi", { game: gameToUse, questionLength: questionText.length, messagesCount: messages.length });
      
      const response = await fetch('/api/wpi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          game: gameToUse,
          screenshot: screenshotData,
          conversationHistory: messages, // Pass full conversation history for context
        }),
      });

      console.log("[v0] WPI: API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[v0] WPI: API error response:", errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("[v0] WPI: API response received successfully");

      // Update game name if API detected one
      if (data.game && !gameToUse) {
        console.log("[v0] WPI: Updating game from API detection:", data.game);
        setSelectedGame(data.game);
      }

      // Check if API returned an error (e.g., non-gaming screenshot)
      if (data.error) {
        console.log("[v0] WPI: API validation error:", data.error);
        const aiResponse: Message = {
          id: String(messages.length + 2),
          type: "ai",
          content: data.error,
          timestamp: new Date(),
          gameTitle: data.game || gameToUse,
        };
        setMessages((prev) => [...prev, aiResponse]);
      } else {
        const aiResponse: Message = {
          id: String(messages.length + 2),
          type: "ai",
          content: data.response || "I couldn't generate a response. Please try again.",
          timestamp: new Date(),
          gameTitle: data.game || gameToUse,
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error("[v0] WPI: Error in handleSubmit:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get gaming assistance. Please make sure your Claude API key is configured.';
      const aiResponse: Message = {
        id: String(messages.length + 2),
        type: "ai",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
        gameTitle: gameToUse,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeGame = () => {
    setStep("selection");
    setSelectedGame(null);
    setCustomGameName("");
    setMessages([]);
  };

  const handleMismatchContinue = (useDetected: boolean) => {
    if (useDetected && detectedGameFromQuestion) {
      setSelectedGame(detectedGameFromQuestion);
    }
    setShowMismatchWarning(false);
    setDetectedGameFromQuestion(null);
    handleSubmit();
  };

  // Initial Selection View
  if (step === "selection") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/30 rounded-2xl w-full max-w-4xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-cyan-500/20">
            <h2 className="text-3xl font-bold text-white">
              Wireplay Interactive Gaming Assistant
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Two Equal Options */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Select Game */}
            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-500/20 to-transparent border-2 border-cyan-500/40 rounded-xl p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎮</span> Select a Game
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Choose from popular games or enter a custom game name
                </p>

                {/* Game Dropdown */}
                <div className="space-y-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowGameDropdown(!showGameDropdown)}
                      className="w-full bg-gray-800 border-2 border-cyan-500/30 rounded-lg p-3 text-white text-left hover:border-cyan-400/60 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-cyan-400" />
                        {gameSearchQuery || "Search or select..."}
                      </span>
                    </button>

                    {showGameDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border-2 border-cyan-500/30 rounded-lg max-h-64 overflow-y-auto z-10">
                        {/* Search Input */}
                        <div className="sticky top-0 p-3 bg-gray-800 border-b border-cyan-500/20">
                          <input
                            type="text"
                            placeholder="Search games..."
                            value={gameSearchQuery}
                            onChange={(e) => setGameSearchQuery(e.target.value)}
                            className="w-full bg-gray-700 border border-cyan-500/30 rounded p-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            autoFocus
                          />
                        </div>

                        {/* Game List */}
                        {filteredGames.map((game) => (
                          <button
                            key={game}
                            onClick={() => {
                              handleGameSelect(game);
                              setGameSearchQuery("");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-white text-sm border-b border-gray-700 last:border-0"
                          >
                            {game}
                          </button>
                        ))}

                        {/* Others Option */}
                        <div className="p-3 border-t border-cyan-500/20">
                          <label className="text-xs text-gray-400 mb-2 block">
                            Or type custom game name:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Game name..."
                              value={customGameName}
                              onChange={(e) => setCustomGameName(e.target.value)}
                              className="flex-1 bg-gray-700 border border-cyan-500/30 rounded p-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && customGameName.trim()) {
                                  handleOthersGame();
                                }
                              }}
                            />
                            <button
                              onClick={handleOthersGame}
                              disabled={!customGameName.trim()}
                              className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: Upload Screenshot */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500/20 to-transparent border-2 border-green-500/40 rounded-xl p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📸</span> Upload Screenshot
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Share a screenshot from your game for context-aware assistance
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-800 border-2 border-dashed border-green-500/40 rounded-lg p-8 text-center hover:border-green-400/60 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Click to upload</p>
                    <p className="text-gray-400 text-xs">PNG, JPG, GIF up to 10MB</p>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {uploadedImage && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-green-500/50">
                      <img
                        src={uploadedImage}
                        alt="Uploaded screenshot"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex gap-3 p-6 border-t-2 border-cyan-500/20 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedGame || customGameName.trim() || uploadedImage) {
                  if (customGameName.trim() && !selectedGame) {
                    handleOthersGame();
                  } else if (selectedGame || uploadedImage) {
                    setStep("chat");
                    if (!selectedGame && uploadedImage) {
                      setMessages([
                        {
                          id: "1",
                          type: "ai",
                          content:
                            "I can see your screenshot! Please tell me which game this is from, or select a game from the dropdown, and then ask your question!",
                          timestamp: new Date(),
                        },
                      ]);
                    } else if (selectedGame) {
                      setMessages([
                        {
                          id: "1",
                          type: "ai",
                          content: `Great! I'm ready to help you with **${selectedGame}**. You can now upload a screenshot or ask your question!`,
                          timestamp: new Date(),
                          gameTitle: selectedGame,
                        },
                      ]);
                    }
                  }
                }
              }}
              disabled={!selectedGame && !customGameName.trim() && !uploadedImage}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-lg hover:from-cyan-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Proceed to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mismatch Warning Dialog
  if (showMismatchWarning) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/40 rounded-2xl max-w-md shadow-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Game Mismatch Detected</h3>
          <p className="text-gray-300 mb-6">
            Your question mentions <span className="text-yellow-400 font-semibold">{detectedGameFromQuestion}</span>, but you selected <span className="text-cyan-400 font-semibold">{selectedGame}</span>.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Which game would you like to ask about?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleMismatchContinue(false)}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
            >
              Keep {selectedGame}
            </button>
            <button
              onClick={() => handleMismatchContinue(true)}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
            >
              Switch to {detectedGameFromQuestion}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Only close if clicking directly on the backdrop, not the modal
        if (e.target === e.currentTarget) {
          console.log("[v0] WPI: Backdrop clicked, closing modal");
          onClose();
        }
      }}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-cyan-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Gaming Assistant
            </h2>
            <p className="text-sm text-cyan-400">
              Game: <span className="font-semibold">{selectedGame}</span>
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
        <div className="border-t-2 border-cyan-500/20 p-6 space-y-4">
          {uploadedImage && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-cyan-500/50">
              <img
                src={uploadedImage}
                alt="Uploaded screenshot"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about strategies, missions, tips, shortcuts..."
              className="flex-1 bg-gray-800 border-2 border-cyan-500/30 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-gray-800/60 resize-none"
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
              className="p-3 bg-gray-800 border-2 border-cyan-500/30 rounded-lg hover:bg-gray-700 hover:border-cyan-400/60 transition-colors"
              title="Upload screenshot"
            >
              <Upload className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeGame}
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
