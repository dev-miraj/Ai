import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("chatapp")

    const conversations = await db.collection("conversations").find({}).sort({ updatedAt: -1 }).toArray()

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, slug } = await request.json()

    const client = await clientPromise
    const db = client.db("chatapp")

    const conversation = {
      title,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    }

    const result = await db.collection("conversations").insertOne(conversation)

    return NextResponse.json({
      _id: result.insertedId,
      ...conversation,
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
