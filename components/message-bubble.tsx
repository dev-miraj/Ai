"use client"

import { useState } from "react"
import { Copy, Check, Bot, User } from "lucide-react"

interface MessageBubbleProps {
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function MessageBubble({ content, role, timestamp }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const formatContent = (content: string) => {
    // Split content by code blocks, headers, and lists
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`|^#{1,6}\s+.*$|^[-*+]\s+.*$|^\d+\.\s+.*$|\*\*[^*]+\*\*|\*[^*]+\*)/gm)
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const code = part.slice(3, -3)
        const language = code.split('\n')[0].trim()
        const codeContent = code.split('\n').slice(1).join('\n')
        
        return (
          <div key={index} className="my-4 relative group">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-300 font-mono">{language}</span>
                <button
                  onClick={() => copyToClipboard(codeContent)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-gray-100 font-mono leading-relaxed">{codeContent}</code>
              </pre>
            </div>
          </div>
        )
      } else if (part.startsWith('`') && part.endsWith('`')) {
        // Inline code
        const code = part.slice(1, -1)
        return (
          <code key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border">
            {code}
          </code>
        )
      } else if (part.match(/^#{1,6}\s+/)) {
        // Headers
        const level = part.match(/^(#{1,6})\s+/)?.[1].length || 1
        const text = part.replace(/^#{1,6}\s+/, '')
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        
        return (
          <HeaderTag 
            key={index} 
            className={`font-bold text-gray-800 mb-3 mt-6 first:mt-0 ${
              level === 1 ? 'text-2xl' : 
              level === 2 ? 'text-xl' : 
              level === 3 ? 'text-lg' : 
              level === 4 ? 'text-base' : 
              level === 5 ? 'text-sm' : 'text-xs'
            }`}
          >
            {text}
          </HeaderTag>
        )
      } else if (part.match(/^[-*+]\s+/)) {
        // Unordered list
        const text = part.replace(/^[-*+]\s+/, '')
        return (
          <div key={index} className="flex items-start space-x-2 mb-2">
            <span className="text-gray-500 mt-2 flex-shrink-0">•</span>
            <span className="text-gray-700">{text}</span>
          </div>
        )
      } else if (part.match(/^\d+\.\s+/)) {
        // Ordered list
        const text = part.replace(/^\d+\.\s+/, '')
        return (
          <div key={index} className="flex items-start space-x-2 mb-2">
            <span className="text-gray-500 mt-2 flex-shrink-0 text-sm">1.</span>
            <span className="text-gray-700">{text}</span>
          </div>
        )
      } else if (part.match(/^\*\*[^*]+\*\*$/)) {
        // Bold text
        const text = part.replace(/^\*\*|\*\*$/g, '')
        return (
          <strong key={index} className="font-bold text-gray-800">
            {text}
          </strong>
        )
      } else if (part.match(/^\*[^*]+\*$/)) {
        // Italic text
        const text = part.replace(/^\*|\*$/g, '')
        return (
          <em key={index} className="italic text-gray-700">
            {text}
          </em>
        )
      } else {
        // Regular text
        return (
          <div key={index} className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {part.split('\n').map((line, lineIndex) => (
              <div key={lineIndex} className="mb-2">
                {line}
                {lineIndex < part.split('\n').length - 1 && <br />}
              </div>
            ))}
          </div>
        )
      }
    })
  }

  const isUser = role === "user"

  return (
    <div className={`flex items-start space-x-4 max-w-4xl mx-auto ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold flex-shrink-0 mt-2">
          <Bot className="w-4 h-4" />
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-6 py-4 ${
            isUser 
              ? "bg-blue-500 text-white shadow-sm" 
              : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <div className={`${isUser ? "text-white" : "text-gray-800"} leading-relaxed`}>
            {formatContent(content)}
          </div>
        </div>
        <div className={`flex items-center mt-3 space-x-3 ${isUser ? "justify-end" : ""}`}>
          <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
          {!isUser && (
            <button
              onClick={() => copyToClipboard(content)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 text-sm font-semibold flex-shrink-0 mt-2">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  )
} 