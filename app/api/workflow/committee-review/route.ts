import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get ideas under committee review
    const { data: ideas, error } = await supabase
      .from("ideas")
      .select(`
        *,
        users!ideas_submitter_id_fkey(name),
        workflow_steps(*),
        idea_comments(
          id,
          comment,
          comment_type,
          created_at,
          users(name)
        )
      `)
      .in("current_step", ["IDEAS_COMMITTEE_REVIEW", "MONITORING"])
      .order("updated_at", { ascending: false })

    if (error) throw error

    // Transform the data
    const transformedIdeas =
      ideas?.map((idea) => ({
        ...idea,
        submitter_name: idea.users?.name || "Unknown",
        recent_comments:
          idea.idea_comments?.map((comment: any) => ({
            ...comment,
            user_name: comment.users?.name || "Unknown",
          })) || [],
      })) || []

    return NextResponse.json(transformedIdeas)
  } catch (error) {
    console.error("Error fetching committee review ideas:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
