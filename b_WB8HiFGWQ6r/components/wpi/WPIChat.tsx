"use client";

import React, { useEffect, useRef } from "react";
import { Loader } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  gameTitle?: string;
  imageData?: string;
}

interface WPIChatProps {
  messages: Message[];
  isLoading: boolean;
}

export default function WPIChat({ messages, isLoading }: WPIChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMarkdown = (text: string) => {
    // Simple markdown support for bold text
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-bold text-cyan-400">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center">
          <div>
            <p className="text-gray-400 text-lg">
              Ready to get gaming assistance!
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Ask your first question to get started
            </p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg ${
                message.type === "user"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-none"
                  : "bg-gray-800 text-gray-100 rounded-2xl rounded-tl-none border border-cyan-500/30"
              } p-4`}
            >
              {message.imageData && message.type === "user" && (
                <img
                  src={message.imageData}
                  alt="User screenshot"
                  className="w-32 h-32 rounded-lg mb-3 object-cover border border-white/20"
                />
              )}
              <p className="text-sm leading-relaxed">
                {renderMarkdown(message.content)}
              </p>
              <p
                className={`text-xs mt-2 ${
                  message.type === "user"
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-tl-none border border-cyan-500/30 p-4 flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
