import { createServerClient } from "./supabase"

export async function sendNotificationEmail(
  recipientEmail: string,
  subject: string,
  message: string,
  ideaId?: number,
): Promise<void> {
  const supabase = createServerClient()

  // Log email to database
  const { error } = await supabase.from("email_notifications").insert({
    idea_id: ideaId || null,
    recipient_email: recipientEmail,
    subject,
    message,
    status: "pending",
  })

  if (error) {
    console.error("Error logging email notification:", error)
  }

  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`Email notification sent to ${recipientEmail}:`, { subject, message })

  // For demo purposes, we'll just log it
  // In real implementation, you would use an email service:
  /*
  try {
    await emailService.send({
      to: recipientEmail,
      subject,
      html: message
    })
    
    // Update status to sent
    await supabase
      .from('email_notifications')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('recipient_email', recipientEmail)
      .eq('subject', subject)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
  */
}
