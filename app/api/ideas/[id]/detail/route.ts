import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const ideaId = Number.parseInt(params.id)

    // Get idea with submitter info
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select(`
        *,
        users!ideas_submitter_id_fkey(name),
        idea_attachments (
          id,
          file_name,
          file_type,
          file_size,
          cloudinary_url,
          cloudinary_secure_url,
          uploaded_at
        )
      `)
      .eq("id", ideaId)
      .single()

    if (ideaError) throw ideaError

    // Get user's vote and calculate vote totals
    const [{ data: userVote }, { data: votes }] = await Promise.all([
      supabase
        .from("idea_votes")
        .select("vote_type")
        .eq("idea_id", ideaId)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("idea_votes")
        .select("vote_type")
        .eq("idea_id", ideaId)
    ])

    // Calculate net vote count (upvotes - downvotes)
    const voteCount = votes?.reduce((acc, vote) => {
      if (vote.vote_type === 'upvote') return acc + 1
      if (vote.vote_type === 'downvote') return acc - 1
      return acc
    }, 0) || 0

    // Get workflow steps with scores
    const { data: workflowSteps, error: stepsError } = await supabase
      .from("workflow_steps")
      .select(`
        *,
        idea_scores(
          financial_score,
          process_score,
          impact_score,
          customer_satisfaction_score,
          ehs_score,
          originality_score,
          total_score,
          comments
        )
      `)
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: true })

    if (stepsError) throw stepsError

    const ideaDetail = {
      ...idea,
      submitter_name: idea.users?.name || "Unknown",
      user_vote: userVote?.vote_type || null,
      vote_count: voteCount || 0,
      workflow_steps: workflowSteps.map((step) => ({
        ...step,
        idea_scores: step.idea_scores?.[0] || null,
      })),
    }

    return NextResponse.json(ideaDetail)
  } catch (error) {
    console.error("Error fetching idea detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
