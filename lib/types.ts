export interface Message {
  _id?: string
  conversationId: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export interface Conversation {
  _id?: string
  title: string
  slug: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}
