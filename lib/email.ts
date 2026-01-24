// Brevo/Sendinblue Email Service
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'

export const sendEmail = async ({
  to,
  subject,
  htmlContent,
  templateId,
}: {
  to: string
  subject?: string
  htmlContent?: string
  templateId?: number
}) => {
  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [{ email: to }],
        subject,
        htmlContent,
        templateId,
        sender: { name: 'Steps', email: 'noreply@steps.com' },
      }),
    })

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}
