import { sql } from "./db"
import type { Idea, WorkflowStep } from "./db"
import { sendNotificationEmail } from "./email"

export const WORKFLOW_STEPS = {
  API_PROMOTER_REVIEW: "API_PROMOTER_REVIEW",
  IDEAS_COMMITTEE_REVIEW: "IDEAS_COMMITTEE_REVIEW",
  LINE_EXECUTIVE_REVIEW: "LINE_EXECUTIVE_REVIEW",
  IMPLEMENTATION: "IMPLEMENTATION",
  MONITORING: "MONITORING",
  COMPLETED: "COMPLETED",
} as const

export type WorkflowStepType = (typeof WORKFLOW_STEPS)[keyof typeof WORKFLOW_STEPS]

export async function createWorkflowStep(
  ideaId: number,
  stepName: string,
  assignedRole: string,
  assignedUserId?: number,
): Promise<WorkflowStep> {
  const result = await sql`
    INSERT INTO workflow_steps (idea_id, step_name, assigned_role, assigned_user_id)
    VALUES (${ideaId}, ${stepName}, ${assignedRole}, ${assignedUserId || null})
    RETURNING *
  `
  return result[0] as WorkflowStep
}

export async function processReview(
  ideaId: number,
  userId: number,
  action: "approve" | "reject" | "escalate",
  comments?: string,
  score?: number,
): Promise<void> {
  // Get current idea details
  const ideaResult = await sql`
    SELECT i.*, u.name as submitter_name, u.email as submitter_email
    FROM ideas i
    JOIN users u ON i.submitter_id = u.id
    WHERE i.id = ${ideaId}
  `

  if (ideaResult.length === 0) {
    throw new Error("Idea not found")
  }

  const idea = ideaResult[0] as Idea & { submitter_email: string }

  // Update current workflow step
  await sql`
    UPDATE workflow_steps 
    SET status = 'Completed',
        action_taken = ${action},
        comments = ${comments || null},
        score = ${score || null},
        completed_at = CURRENT_TIMESTAMP
    WHERE idea_id = ${ideaId} AND status = 'Pending'
  `

  let nextStep: WorkflowStepType | null = null
  let newStatus = idea.status

  // Determine next step based on current step and action
  switch (idea.current_step) {
    case WORKFLOW_STEPS.API_PROMOTER_REVIEW:
      if (action === "approve") {
        nextStep = WORKFLOW_STEPS.IMPLEMENTATION
        newStatus = "Approved for Implementation"
      } else if (action === "escalate") {
        nextStep = WORKFLOW_STEPS.IDEAS_COMMITTEE_REVIEW
        newStatus = "Escalated to Committee"
      } else {
        newStatus = "Rejected"
      }
      break

    case WORKFLOW_STEPS.IDEAS_COMMITTEE_REVIEW:
      if (action === "approve") {
        nextStep = WORKFLOW_STEPS.IMPLEMENTATION
        newStatus = "Approved for Implementation"
      } else if (action === "escalate") {
        nextStep = WORKFLOW_STEPS.LINE_EXECUTIVE_REVIEW
        newStatus = "Escalated to Executive"
      } else {
        newStatus = "Rejected"
      }
      break

    case WORKFLOW_STEPS.LINE_EXECUTIVE_REVIEW:
      if (action === "approve") {
        nextStep = WORKFLOW_STEPS.IMPLEMENTATION
        newStatus = "Approved for Implementation"
      } else {
        newStatus = "Rejected"
      }
      break

    case WORKFLOW_STEPS.IMPLEMENTATION:
      if (action === "approve") {
        nextStep = WORKFLOW_STEPS.MONITORING
        newStatus = "Under Monitoring"
      }
      break

    case WORKFLOW_STEPS.MONITORING:
      if (action === "approve") {
        nextStep = WORKFLOW_STEPS.COMPLETED
        newStatus = "Completed"
      }
      break
  }

  // Update idea status and current step
  await sql`
    UPDATE ideas 
    SET status = ${newStatus},
        current_step = ${nextStep || idea.current_step},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${ideaId}
  `

  // Create next workflow step if needed
  if (nextStep) {
    const assignedRole = getAssignedRoleForStep(nextStep)
    await createWorkflowStep(ideaId, nextStep, assignedRole)
  }

  // Send notifications
  await sendWorkflowNotifications(ideaId, action, nextStep, idea)
}

function getAssignedRoleForStep(step: WorkflowStepType): string {
  switch (step) {
    case WORKFLOW_STEPS.API_PROMOTER_REVIEW:
      return "API Promoter"
    case WORKFLOW_STEPS.IDEAS_COMMITTEE_REVIEW:
      return "Ideas Committee"
    case WORKFLOW_STEPS.LINE_EXECUTIVE_REVIEW:
      return "Line Executive"
    case WORKFLOW_STEPS.IMPLEMENTATION:
      return "Initiator"
    case WORKFLOW_STEPS.MONITORING:
      return "Ideas Committee"
    default:
      return "Admin"
  }
}

async function sendWorkflowNotifications(
  ideaId: number,
  action: string,
  nextStep: WorkflowStepType | null,
  idea: Idea & { submitter_email: string },
): Promise<void> {
  // Get users to notify based on next step
  const recipientRoles: string[] = []

  if (nextStep) {
    recipientRoles.push(getAssignedRoleForStep(nextStep))
  }

  // Always notify the submitter
  const submitterEmail = idea.submitter_email

  // Get recipient emails
  const recipients = await sql`
    SELECT email FROM users WHERE role = ANY(${recipientRoles})
  `

  const allEmails = [submitterEmail, ...recipients.map((r) => r.email)]

  // Send notifications
  for (const email of allEmails) {
    await sendNotificationEmail(
      email,
      `Idea ${idea.idea_number} - Status Update`,
      `Your idea "${idea.subject}" has been ${action}d and is now in ${nextStep || "final"} stage.`,
    )
  }
}
