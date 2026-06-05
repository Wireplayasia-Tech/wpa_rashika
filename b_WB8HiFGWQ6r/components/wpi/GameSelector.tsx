"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";

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

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black border-2 border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-transparent">
          <h2 className="text-2xl font-bold text-white mb-4">
            🎮 Select a Game
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Search for a game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/60 border-2 border-cyan-500/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-gray-800 transition-all"
            />
          </div>
        </div>

        {/* Games List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <button
                  key={game}
                  onClick={() => onSelectGame(game)}
                  className="p-4 bg-gray-800/40 border-2 border-cyan-500/20 rounded-lg hover:border-cyan-400/60 hover:bg-gray-700/60 transition-all text-white text-left hover:translate-x-1 duration-200 group"
                >
                  <span className="font-medium group-hover:text-cyan-400 transition-colors">
                    {game}
                  </span>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                <p className="text-lg">No games found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="border-t-2 border-cyan-500/30 px-6 py-4 text-center text-sm text-gray-300 bg-gradient-to-r from-cyan-500/5 to-transparent">
          <p>
            We have{" "}
            <span className="text-cyan-400 font-semibold">{games.length}</span>{" "}
            games available. Click on any to get started! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
