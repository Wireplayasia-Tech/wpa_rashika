"use client";

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

interface GameSelectorProps {
  games: string[];
  onSelectGame: (game: string) => void;
}

export default function GameSelector({
  games,
  onSelectGame,
}: GameSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    return games.filter((game) =>
      game.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, games]);

  const topGames = games.slice(0, 20);
  const otherGames = games.slice(20);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Select a Game
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Search for a game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Games List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <button
                  key={game}
                  onClick={() => onSelectGame(game)}
                  className="p-4 bg-gray-800 border border-cyan-500/20 rounded-lg hover:border-cyan-500/60 hover:bg-gray-700 transition-all text-white text-left hover:translate-x-1 duration-200"
                >
                  <span className="font-medium">{game}</span>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No games found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="border-t border-cyan-500/20 px-6 py-4 text-center text-sm text-gray-400">
          <p>
            We have{" "}
            <span className="text-cyan-400 font-semibold">{games.length}</span>{" "}
            games available. Click on any to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
