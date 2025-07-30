import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { createWorkflowStep, WORKFLOW_STEPS } from "@/lib/workflow"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get user role to filter ideas
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("zoho_id", userId).single()

    console.log("User data ideas:", userData);

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRole = userData.role

    let query = supabase.from("ideas").select(`
  *,
  users:submitter_id (
    name
  )
`);

    // Filter ideas based on user role
    switch (userRole) {
      case "Initiator":
        query = query.eq("submitter_id", userData.id)
        break

      case "API Promoter":
        query = query.eq("current_step", WORKFLOW_STEPS.API_PROMOTER_REVIEW)
        break

      case "Ideas Committee":
        query = query.in("current_step", [WORKFLOW_STEPS.IDEAS_COMMITTEE_REVIEW, WORKFLOW_STEPS.MONITORING])
        break

      case "Line Executive":
        query = query.eq("current_step", WORKFLOW_STEPS.LINE_EXECUTIVE_REVIEW)
        break

      default:
        // Admin or other roles see all ideas
        break
    }

    const { data: ideas, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    // Transform the data to match expected format
    const transformedIdeas =
      ideas?.map((idea) => ({
        ...idea,
        submitter_name: idea.users?.name || "Unknown",
      })) || []

    return NextResponse.json(transformedIdeas)
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("zoho_id", userId)
      .single()

    if (userError || !userData) {
      console.error("User lookup error:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      subject,
      description,
      country,
      department,
      workflowVersion,
      expectedBenefit,
      implementationEffort,
      priority = "Medium",
      status ="Submitted for review"
    } = body

      console.log("Creating idea with data:", body);
    // Enhanced validation
    if (!subject || !description) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: { subject: !subject, description: !description }
      }, { status: 400 })
    }

    // More robust count query with error handling
    const { count, error: countError } = await supabase
      .from("ideas")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Count query error:", countError)
      return NextResponse.json({ error: "Failed to generate idea number" }, { status: 500 })
    }

    const ideaNumber = `ID-${String((count || 0) + 1).padStart(3, "0")}`

    // Prepare insert data with explicit null handling
    const insertData = {
      idea_number: ideaNumber,
      subject: subject.trim(),
      description: description.trim(),
      country: country || null,
      department: department || null,
      workflow_version: workflowVersion || null,
      expected_benefit: expectedBenefit || null,
      implementation_effort: implementationEffort || null,
      priority,
      status,
      submitter_id: userData.id,
      current_step: WORKFLOW_STEPS.API_PROMOTER_REVIEW,
      created_at: new Date().toISOString(), // Explicit timestamp
    }

    console.log("Attempting to insert:", insertData)

    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .insert(insertData)
      .select()
      .single()

    if (ideaError) {
      console.error("Insert error details:", {
        message: ideaError.message,
        details: ideaError.details,
        hint: ideaError.hint,
        code: ideaError.code
      })
      
      // More specific error handling
      if (ideaError.code === '23505') {
        return NextResponse.json({ error: "Duplicate idea number" }, { status: 409 })
      }
      if (ideaError.code === '23503') {
        return NextResponse.json({ error: "Foreign key constraint violation" }, { status: 400 })
      }
      if (ideaError.code === '23502') {
        return NextResponse.json({ error: "Missing required field" }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: "Insert failed", 
        details: ideaError.message 
      }, { status: 500 })
    }

    // Wrap workflow step creation in try-catch
    try {
      await createWorkflowStep(idea.id, WORKFLOW_STEPS.API_PROMOTER_REVIEW, "API Promoter")
    } catch (workflowError) {
      console.error("Workflow step creation failed:", workflowError)
      // Optionally rollback the idea creation or continue without failing
      // For now, we'll log but not fail the entire operation
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error("Unhandled error in POST /api/ideas:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
