"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Trash2, Bot } from "lucide-react"
import Sidebar from "@/components/sidebar"
import ChatInput from "@/components/chat-input"
import MessageBubble from "@/components/message-bubble"
import type { Message, Conversation } from "@/lib/types"

interface ChatMessage {
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const slug = params?.slug as string

  useEffect(() => {
    if (slug) {
      fetchConversation()
    }
  }, [slug])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${slug}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/")
          return
        }
        throw new Error("Failed to fetch conversation")
      }

      const data = await response.json()
      setConversation(data.conversation)
      setMessages(
        data.messages.map((msg: Message) => ({
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.timestamp),
        })),
      )
    } catch (error) {
      console.error("Error fetching conversation:", error)
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!conversation) return

    setIsSending(true)

    // Add user message immediately to UI
    const userMessage: ChatMessage = {
      content: message,
      role: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId: conversation._id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add AI response to UI
        const aiMessage: ChatMessage = {
          content: data.response,
          role: "assistant",
          timestamp: new Date(data.assistantMessage.timestamp),
        }
        setMessages((prev) => [...prev, aiMessage])
        
        // Trigger sidebar refresh
        window.dispatchEvent(new CustomEvent('conversationCreated'))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await fetch(`/api/conversations/${slug}`, {
          method: "DELETE",
        })
        router.push("/")
      } catch (error) {
        console.error("Error deleting conversation:", error)
      }
    }
    setDropdownOpen(false)
  }

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar activeSlug={slug} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading conversation...</div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Conversation not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen mx-auto bg-white max-h-screen">
      <Sidebar activeSlug={slug} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-800">{conversation.title}</h1>
            </div>
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Open conversation menu"
                title="More options"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Rename</span>
                  </button>
                  <hr className="my-1 opacity-10" />
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col py-8 overflow-y-auto space-y-8">
          {messages.map((message, index) => (
            <div key={index} className="group px-4">
              <MessageBubble
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            </div>
          ))}

          {isSending && (
            <div className="flex items-start space-x-4 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold flex-shrink-0 mt-2">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">Gemini is thinking...</span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Generating a detailed response for you...
                  </div>
                  <div className="mt-2 flex space-x-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isSending} />
      </div>
    </div>
  )
}
