import { sql } from "./db"

export async function sendNotificationEmail(
  recipientEmail: string,
  subject: string,
  message: string,
  ideaId?: number,
): Promise<void> {
  // Log email to database
  await sql`
    INSERT INTO email_notifications (idea_id, recipient_email, subject, message, status)
    VALUES (${ideaId || null}, ${recipientEmail}, ${subject}, ${message}, 'pending')
  `

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
    await sql`
      UPDATE email_notifications 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE recipient_email = ${recipientEmail} AND subject = ${subject}
    `
  } catch (error) {
    console.error('Failed to send email:', error)
  }
  */
}
