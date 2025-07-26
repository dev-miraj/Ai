"use client"

import { MoreHorizontal, Edit, Trash2, Sparkles, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function ChatScreen() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const messages = [
    {
      type: "human",
      content: "What's the difference between machine learning and artificial intelligence?",
      time: "2:34 PM",
    },
    {
      type: "ai",
      content:
        "Great question! Here's the key difference:\n\n**Artificial Intelligence (AI)** is the broader concept of creating machines that can perform tasks that typically require human intelligence. It's like the umbrella term.\n\n**Machine Learning (ML)** is a subset of AI that focuses on algorithms that can learn and improve from data without being explicitly programmed for every scenario.",
      time: "2:35 PM",
    },
    {
      type: "human",
      content: "Can you give me some practical examples of each?",
      time: "2:36 PM",
    },
    {
      type: "ai",
      content:
        "Here are some practical examples:\n\n🤖 **AI Examples (broader applications):**\n• Siri, Alexa (voice assistants)\n• Chess-playing computers\n• Autonomous vehicles\n• Chatbots like me!\n\n📊 **Machine Learning Examples (data-driven learning):**\n• Netflix movie recommendations\n• Email spam detection\n• Credit card fraud detection\n• Image recognition in photos",
      time: "2:37 PM",
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h1 className="text-lg font-semibold text-gray-800">Learning NLP vs LLM</h1>
          </div>
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </button>
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Rename conversation</span>
                </button>
                <hr className="my-1 opacity-10" />
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6">
        {messages.map((message, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                message.type === "human" ? "bg-blue-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}
            >
              {message.type === "human" ? "H" : "AI"}
            </div>
            <div className="flex-1">
              <div
                className={`rounded-2xl px-4 py-3 max-w-3xl ${
                  message.type === "human" ? "bg-gray-100" : "bg-white border border-gray-200"
                }`}
              >
                <div className="text-gray-800 whitespace-pre-line">
                  {message.content.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <strong key={i}>{line.slice(2, -2)}</strong>
                    }
                    if (line.startsWith("🤖") || line.startsWith("📊")) {
                      return (
                        <h4 key={i} className="font-semibold text-gray-800 mb-2">
                          {line}
                        </h4>
                      )
                    }
                    if (line.startsWith("•")) {
                      return (
                        <li key={i} className="ml-2">
                          {line.slice(1).trim()}
                        </li>
                      )
                    }
                    return (
                      <p key={i} className={line ? "mb-3" : ""}>
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{message.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask me Anything"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-4 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
        </div>
        <div className="flex items-center justify-end mt-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{inputValue.length}/1000</span>
            <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer">
              <span className="text-sm">Send</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
