import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

     const { data: userData, error: userError } = await supabase.from("users").select("*").eq("zoho_id", userId).single()
    const ideaId = Number.parseInt(params.id)
    const { comment } = await request.json()

    const { data: newComment, error } = await supabase
      .from("idea_comments")
      .insert({
        idea_id: ideaId,
        user_id: Number.parseInt(userData.id),
        comment,
        comment_type: "general",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newComment)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
