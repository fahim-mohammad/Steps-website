// WhatsApp API Service (Meta)
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
const WHATSAPP_API_URL = `https://graph.instagram.com/v18.0`

export const sendWhatsAppMessage = async ({
  phoneNumber,
  message,
}: {
  phoneNumber: string
  message: string
}) => {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`WhatsApp send failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('WhatsApp service error:', error)
    throw error
  }
}
