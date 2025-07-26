import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import clientPromise from "@/lib/mongodb"
import { generateSlug, extractTitle } from "@/lib/utils"

// Check for required environment variables
if (!process.env.GOOGLE_GEMINI_API_KEY) {
  console.warn("GOOGLE_GEMINI_API_KEY is not set. Chat functionality will be limited.")
}

const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json()

    const client = await clientPromise
    const db = client.db("chatapp")

    let currentConversationId = conversationId
    let isNewConversation = false

    // If no conversationId, create a new conversation
    if (!conversationId) {
      const title = extractTitle(message)
      const slug = generateSlug(title)

      const conversation = {
        title,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
      }

      const conversationResult = await db.collection("conversations").insertOne(conversation)
      currentConversationId = conversationResult.insertedId.toString()
      isNewConversation = true
    }

    // Save user message
    const userMessage = {
      conversationId: currentConversationId,
      content: message,
      role: "user" as const,
      timestamp: new Date(),
    }

    await db.collection("messages").insertOne(userMessage)

    // Get conversation history for context
    const previousMessages = await db
      .collection("messages")
      .find({ conversationId: currentConversationId })
      .sort({ timestamp: 1 })
      .limit(10) // Limit to last 10 messages for context
      .toArray()

    // Prepare conversation context for Gemini
    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Call Google Gemini API
    if (!genAI) {
      return NextResponse.json({ 
        error: "AI service is not configured. Please set GOOGLE_GEMINI_API_KEY environment variable." 
      }, { status: 503 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // Exclude the last message as it will be sent separately
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    })

    // Create a system prompt for better formatting
    const systemPrompt = `You are a helpful AI assistant. Please provide detailed, well-structured responses with proper formatting. Use markdown formatting for:
- Headers (## for sections)
- Code blocks (\`\`\`language for syntax highlighting)
- Lists (bullet points and numbered lists)
- Inline code (\`code\`)
- Bold text (**bold**)
- Italic text (*italic*)

Make your responses comprehensive and educational, similar to how Google Gemini provides detailed explanations.`
    
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`)
    const response = await result.response
    const aiResponse = response.text()

    // Save AI response
    const assistantMessage = {
      conversationId: currentConversationId,
      content: aiResponse,
      role: "assistant" as const,
      timestamp: new Date(),
    }

    await db.collection("messages").insertOne(assistantMessage)

    // Update conversation metadata
    await db.collection("conversations").updateOne(
      { _id: new (await import("mongodb")).ObjectId(currentConversationId) },
      {
        $set: { updatedAt: new Date() },
        $inc: { messageCount: 2 }, // Increment by 2 (user + assistant)
      },
    )

    // Get the conversation slug for response
    let conversationSlug = null
    if (isNewConversation) {
      const conversation = await db
        .collection("conversations")
        .findOne({ _id: new (await import("mongodb")).ObjectId(currentConversationId) })
      conversationSlug = conversation?.slug
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: currentConversationId,
      conversationSlug: isNewConversation ? conversationSlug : undefined,
      userMessage: {
        content: message,
        role: "user",
        timestamp: userMessage.timestamp,
      },
      assistantMessage: {
        content: aiResponse,
        role: "assistant",
        timestamp: assistantMessage.timestamp,
      },
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to process message",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}
