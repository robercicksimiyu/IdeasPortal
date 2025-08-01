import { createServerClient } from "./supabase"
import { sendNotificationEmail } from "./email"
import { Tables } from "@/app/ideas-portal-data-types"

export const WORKFLOW_STEPS = {
  IDEAS_COMMITTEE_REVIEW: "IDEAS_COMMITTEE_REVIEW",
  LINE_EXECUTIVE_REVIEW: "LINE_EXECUTIVE_REVIEW",
  IMPLEMENTATION: "IMPLEMENTATION",
  COMPLETED: "COMPLETED",
} as const

export type WorkflowStepType = (typeof WORKFLOW_STEPS)[keyof typeof WORKFLOW_STEPS]

export async function createWorkflowStep(
  ideaId: number,
  stepName: string,
  assignedRole: string,
): Promise<Tables<"workflow_steps">> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("workflow_steps")
    .insert({
      idea_id: ideaId,
      step_name: stepName,
      assigned_role: assignedRole,
    })
    .select()
    .single()

  if (error) throw error
  return data as Tables<"workflow_steps">
}

export async function processReview(
  ideaId: number,
  userId: number,
  action: "approve" | "reject" | "escalate",
  comments?: string,
  score?: number,
): Promise<void> {
  const supabase = createServerClient()

  // Get current idea details with submitter info
  const { data: ideaData, error: ideaError } = await supabase
    .from("ideas")
    .select(`
      *`)
    .eq("id", ideaId)
    .single()

  if (ideaError) throw ideaError

  const idea = ideaData as Tables<"ideas"> & {
    users: { name: string; email: string }
  }

  // Update current workflow step
  const { error: updateStepError } = await supabase
    .from("workflow_steps")
    .update({
      status: "Completed",
      action_taken: action,
      comments: comments || null,
      score: score || null,
      completed_at: new Date().toISOString(),
    })
    .eq("idea_id", ideaId)
    .eq("status", "Pending")

  if (updateStepError) throw updateStepError

  let nextStep: WorkflowStepType | null = null
  let newStatus = idea.status

  // Determine next step based on current step and action
  switch (idea.current_step) {
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
        nextStep = WORKFLOW_STEPS.COMPLETED
        newStatus = "Completed"
      }
      break
  }

  // Update idea status and current step
  const { error: updateIdeaError } = await supabase
    .from("ideas")
    .update({
      status: newStatus,
      current_step: nextStep || idea.current_step,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ideaId)

  if (updateIdeaError) throw updateIdeaError

  // Create next workflow step if needed
  if (nextStep) {
    const assignedRole = getAssignedRoleForStep(nextStep)
    await createWorkflowStep(ideaId, nextStep, assignedRole)
  }

  // Send notifications
  //await sendWorkflowNotifications(ideaId, action, nextStep, idea)
}

function getAssignedRoleForStep(step: WorkflowStepType): string {
  switch (step) {
    case WORKFLOW_STEPS.IDEAS_COMMITTEE_REVIEW:
      return "API Promoter"
    case WORKFLOW_STEPS.LINE_EXECUTIVE_REVIEW:
      return "Line Executive"
    case WORKFLOW_STEPS.IMPLEMENTATION:
      return "BU Manager"
    case WORKFLOW_STEPS.COMPLETED:
      return "Ideas Committee"
    default:
      return "Admin"
  }
}

async function sendWorkflowNotifications(
  ideaId: number,
  action: string,
  nextStep: WorkflowStepType | null,
  idea: Tables<"ideas"> & { users: { name: string; email: string } },
): Promise<void> {
  const supabase = createServerClient()

  // Get users to notify based on next step
  const recipientRoles: string[] = []

  if (nextStep) {
    recipientRoles.push(getAssignedRoleForStep(nextStep))
  }

  // Always notify the submitter
  const submitterEmail = idea.users.email

  console.log("Notifying submitter:", submitterEmail);

  // Get recipient emails
  const { data: recipients } = await supabase.from("users").select("email").in("role", recipientRoles)

  const allEmails = [submitterEmail, ...(recipients?.map((r) => r.email) || [])]

  // Send notifications
  for (const email of allEmails) {
    await sendNotificationEmail(
      email,
      `Idea ${idea.idea_number} - Status Update`,
      `Your idea "${idea.subject}" has been ${action}d and is now in ${nextStep || "final"} stage.`,
      ideaId,
    )
  }
}
