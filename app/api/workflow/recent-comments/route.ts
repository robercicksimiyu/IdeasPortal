import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get ideas with recent comments (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: ideas, error } = await supabase
      .from("ideas")
      .select(`
        *,
        users!ideas_submitter_id_fkey(name),
        workflow_steps(*),
        idea_comments!inner(
          id,
          comment,
          comment_type,
          created_at,
          users(name)
        )
      `)
      .gte("idea_comments.created_at", sevenDaysAgo.toISOString())
      .order("updated_at", { ascending: false })

    if (error) throw error

    // Transform the data and filter for recent comments
    const transformedIdeas =
      ideas
        ?.map((idea) => ({
          ...idea,
          submitter_name: idea.users?.name || "Unknown",
          recent_comments:
            idea.idea_comments
              ?.filter((comment: any) => new Date(comment.created_at) >= sevenDaysAgo)
              .map((comment: any) => ({
                ...comment,
                user_name: comment.users?.name || "Unknown",
              })) || [],
        }))
        .filter((idea) => idea.recent_comments.length > 0) || []

    return NextResponse.json(transformedIdeas)
  } catch (error) {
    console.error("Error fetching recent comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
