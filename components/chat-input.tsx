"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, Sparkles, Send, Bot } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit}>
        <div className="relative max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              placeholder="Ask Gemini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-4 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none bg-white shadow-sm"
              maxLength={1000}
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            
            {/* Dynamic icon based on input state */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {message.trim() ? (
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 px-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">{message.length}/1000</span>
            </div>
            <div className="text-xs text-gray-400">
              Gemini can make mistakes, so double-check it
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
