import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createWorkflowStep, WORKFLOW_STEPS } from "@/lib/workflow"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role to filter ideas
    const userResult = await sql`
      SELECT role FROM users WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRole = userResult[0].role

    let ideas

    // Filter ideas based on user role
    switch (userRole) {
      case "Initiator":
        ideas = await sql`
          SELECT i.*, u.name as submitter_name
          FROM ideas i
          JOIN users u ON i.submitter_id = u.id
          WHERE i.submitter_id = ${userId}
          ORDER BY i.created_at DESC
        `
        break

      case "API Promoter":
        ideas = await sql`
          SELECT i.*, u.name as submitter_name
          FROM ideas i
          JOIN users u ON i.submitter_id = u.id
          WHERE i.current_step = ${WORKFLOW_STEPS.API_PROMOTER_REVIEW}
          ORDER BY i.created_at DESC
        `
        break

      case "Ideas Committee":
        ideas = await sql`
          SELECT i.*, u.name as submitter_name
          FROM ideas i
          JOIN users u ON i.submitter_id = u.id
          WHERE i.current_step IN (${WORKFLOW_STEPS.IDEAS_COMMITTEE_REVIEW}, ${WORKFLOW_STEPS.MONITORING})
          ORDER BY i.created_at DESC
        `
        break

      case "Line Executive":
        ideas = await sql`
          SELECT i.*, u.name as submitter_name
          FROM ideas i
          JOIN users u ON i.submitter_id = u.id
          WHERE i.current_step = ${WORKFLOW_STEPS.LINE_EXECUTIVE_REVIEW}
          ORDER BY i.created_at DESC
        `
        break

      default:
        // Admin or other roles see all ideas
        ideas = await sql`
          SELECT i.*, u.name as submitter_name
          FROM ideas i
          JOIN users u ON i.submitter_id = u.id
          ORDER BY i.created_at DESC
        `
    }

    return NextResponse.json(ideas)
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    } = body

    // Generate idea number
    const ideaCount = await sql`SELECT COUNT(*) as count FROM ideas`
    const ideaNumber = `ID-${String(Number(ideaCount[0].count) + 1).padStart(3, "0")}`

    // Create idea
    const ideaResult = await sql`
      INSERT INTO ideas (
        idea_number, subject, description, country, department,
        workflow_version, expected_benefit, implementation_effort,
        priority, submitter_id, current_step
      )
      VALUES (
        ${ideaNumber}, ${subject}, ${description}, ${country}, ${department},
        ${workflowVersion}, ${expectedBenefit}, ${implementationEffort},
        ${priority}, ${userId}, ${WORKFLOW_STEPS.API_PROMOTER_REVIEW}
      )
      RETURNING *
    `

    const idea = ideaResult[0]

    // Create initial workflow step
    await createWorkflowStep(idea.id, WORKFLOW_STEPS.API_PROMOTER_REVIEW, "API Promoter")

    return NextResponse.json(idea)
  } catch (error) {
    console.error("Error creating idea:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
