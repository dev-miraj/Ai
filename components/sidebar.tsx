"use client"

import { MessageCircle, Edit, Trash2, MoreHorizontal, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Conversation } from "@/lib/types"

interface SidebarProps {
  activeSlug?: string
}

export default function Sidebar({ activeSlug }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchConversations()
    
    // Listen for conversation creation events
    const handleConversationCreated = () => {
      fetchConversations()
    }
    
    window.addEventListener('conversationCreated', handleConversationCreated)
    
    return () => {
      window.removeEventListener('conversationCreated', handleConversationCreated)
    }
  }, [])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/conversations")
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (conversation: Conversation) => {
    setEditingId(conversation._id!)
    setEditTitle(conversation.title)
    setDropdownOpen(null)
  }

  const handleSaveEdit = async (slug: string) => {
    try {
      await fetch(`/api/conversations/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      })
      setEditingId(null)
      fetchConversations()
    } catch (error) {
      console.error("Error updating conversation:", error)
    }
  }

  const handleDelete = async (slug: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await fetch(`/api/conversations/${slug}`, {
          method: "DELETE",
        })
        fetchConversations()
        if (activeSlug === slug) {
          router.push("/")
        }
      } catch (error) {
        console.error("Error deleting conversation:", error)
      }
    }
    setDropdownOpen(null)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <span className="font-bold text-gray-800 text-sm">Softworks-IT</span>
            <div className="text-xs text-gray-500">2.5 Flash</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-700"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">New chat</span>
          </Link>
        </div>

        {/* Conversations */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs uppercase font-semibold">Recent conversations</span>
            <button
              onClick={fetchConversations}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              aria-label="Refresh conversations"
              title="Refresh conversations"
            >
              <RefreshCw className={`w-3 h-3 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-1 mt-3">
            {conversations.map((conversation) => (
              <div key={conversation._id} className="group relative">
                {editingId === conversation._id ? (
                  <div className="flex items-center space-x-2 px-2 py-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-gray-800 text-white px-2 py-1 rounded text-sm"
                      placeholder="Enter conversation title"
                      aria-label="Edit conversation title"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(conversation.slug)
                        }
                      }}
                      onBlur={() => handleSaveEdit(conversation.slug)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Link
                      href={`/conversation/${conversation.slug}`}
                      className={`flex-1 text-sm text-gray-700 truncate ${
                        activeSlug === conversation.slug ? "bg-blue-100 px-2 py-1 rounded text-blue-700" : ""
                      }`}
                    >
                      {conversation.title}
                    </Link>
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === conversation._id ? null : conversation._id!)}
                        className="p-1 hover:bg-gray-200 rounded"
                        aria-label="Open conversation menu"
                        title="More options"
                      >
                        <MoreHorizontal className="w-3 h-3 text-gray-500" />
                      </button>
                      {dropdownOpen === conversation._id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleEdit(conversation)}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(conversation.slug)}
                            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-xs text-gray-500">Softworks-IT</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Softworks-IT Farm</p>
        </div>
      </div>
    </div>
  )
}
