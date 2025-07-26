import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("chatapp")

    const conversation = await db.collection("conversations").findOne({ slug: params.slug })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const messages = await db
      .collection("messages")
      .find({ conversationId: conversation._id.toString() })
      .sort({ timestamp: 1 })
      .toArray()

    return NextResponse.json({
      conversation,
      messages,
    })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { title } = await request.json()

    const client = await clientPromise
    const db = client.db("chatapp")

    const result = await db.collection("conversations").updateOne(
      { slug: params.slug },
      {
        $set: {
          title,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating conversation:", error)
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("chatapp")

    const conversation = await db.collection("conversations").findOne({ slug: params.slug })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Delete all messages in the conversation
    await db.collection("messages").deleteMany({
      conversationId: conversation._id.toString(),
    })

    // Delete the conversation
    await db.collection("conversations").deleteOne({ slug: params.slug })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
