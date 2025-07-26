"use client"

import { Zap, Bot } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import ChatInput from "./chat-input"

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const suggestions = [
    "Write a Python function to calculate fibonacci numbers",
    "Create a React component for a todo list",
    "Explain machine learning concepts in simple terms",
    "Help me write a professional email",
    "Generate a business plan template",
    "Create a JavaScript function to sort an array"
  ]

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (data.success && data.conversationSlug) {
        // Trigger sidebar refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('conversationCreated'))
        router.push(`/conversation/${data.conversationSlug}`)
      } else if (data.error) {
        setError(data.error)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
        {/* Avatar */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          How can I help you today?
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center max-w-2xl mb-12 leading-relaxed text-lg">
          I'm Gemini, an AI assistant that can help you with coding, writing, analysis, and much more.
        </p>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Prompt Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
