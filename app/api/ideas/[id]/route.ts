import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const ideaId = Number.parseInt(params.id)
    const { subject, description, expected_benefit } = await request.json()

    // Get user role and idea details
    const { data: userData } = await supabase.from("users").select("role").eq("zoho_id", userId).single()

    const { data: idea } = await supabase.from("ideas").select("submitter_id").eq("id", ideaId).single()

    // Check permissions
    const canEdit =
      userData?.role === "Admin" ||
      userData?.role === "Ideas Committee" ||
      idea?.submitter_id === Number.parseInt(userId)

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update idea
    const { data: updatedIdea, error } = await supabase
      .from("ideas")
      .update({
        subject,
        description,
        expected_benefit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ideaId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedIdea)
  } catch (error) {
    console.error("Error updating idea:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
