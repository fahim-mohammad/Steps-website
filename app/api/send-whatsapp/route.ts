import { NextRequest, NextResponse } from 'next/server';

/**
 * Send WhatsApp notification using Meta WhatsApp Business API
 * Endpoint: POST /api/send-whatsapp
 */
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, name, amount, status } = await request.json();

    // Validate required fields
    if (!phoneNumber || !name || amount === undefined || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const whatsappToken = process.env.WHATSAPP_API_TOKEN;
    if (!whatsappToken) {
      return NextResponse.json(
        { error: 'WhatsApp service not configured' },
        { status: 500 }
      );
    }

    // WhatsApp Business Account ID (you'll need to get this from Meta)
    // Format: https://graph.instagram.com/v18.0/{PHONE_NUMBER_ID}/messages
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '123456789'; // Replace with your actual phone number ID

    // Message content based on status
    const messageText =
      status === 'approved'
        ? `Hello ${name}! 👋\n\nYour deposit of ৳${amount.toLocaleString()} has been approved! ✓\n\nThe amount has been added to your STEPS fund contribution.\n\nThank you for participating in our community fund!`
        : `Hello ${name}! 👋\n\nWe've reviewed your deposit of ৳${amount.toLocaleString()}.\n\nUnfortunately, it has been rejected. Please contact the fund manager for details.\n\nBest regards,\nSTEPS Fund Management`;

    // Send via Meta WhatsApp Business API
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: messageText,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: response.status }
      );
    }

    console.log('WhatsApp message sent successfully:', { phoneNumber, name, status });
    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      messageId: result.messages?.[0]?.id,
    });
  } catch (error) {
    console.error('WhatsApp service error:', error);
    return NextResponse.json(
      { error: 'WhatsApp service error' },
      { status: 500 }
    );
  }
}
