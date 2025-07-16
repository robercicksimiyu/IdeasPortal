import { type NextRequest, NextResponse } from "next/server"
import { processReview } from "@/lib/workflow"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, comments, score } = body

    await processReview(Number.parseInt(params.id), Number.parseInt(userId), action, comments, score)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
