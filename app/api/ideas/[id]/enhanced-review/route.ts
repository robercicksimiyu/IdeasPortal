import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { processReview } from "@/lib/workflow"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const ideaId = Number.parseInt(params.id)
    const { action, comments, implementation_effort, scores } = await request.json()

    console.log("action", action)

    // Get current workflow step
    const { data: currentStep } = await supabase
      .from("workflow_steps")
      .select("id")
      .eq("idea_id", ideaId)
      .eq("status", "Pending")
      .single()

    // Process the review using existing workflow
    await processReview(ideaId, Number.parseInt(userId), action, comments)

    // Update workflow step with implementation effort if provided
    if (implementation_effort && currentStep) {
      await supabase.from("workflow_steps").update({ implementation_effort }).eq("id", currentStep.id)
    }

    // Save scores
    if (currentStep) {
      await supabase.from("idea_scores").insert({
        idea_id: ideaId,
        user_id: Number.parseInt(userId),
        workflow_step_id: currentStep.id,
        financial_score: scores.financial_score,
        process_score: scores.process_score,
        impact_score: scores.impact_score,
        customer_satisfaction_score: scores.customer_satisfaction_score,
        ehs_score: scores.ehs_score,
        originality_score: scores.originality_score,
        comments: comments,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing enhanced review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
