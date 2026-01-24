import { NextRequest, NextResponse } from 'next/server';

/**
 * Send email notification using Brevo API
 * Endpoint: POST /api/send-email
 */
export async function POST(request: NextRequest) {
  try {
    const { to, name, amount, status } = await request.json();

    // Validate required fields
    if (!to || !name || amount === undefined || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const brevoKey = process.env.BREVO_API_KEY;
    if (!brevoKey) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Email content based on status
    const subject =
      status === 'approved'
        ? 'Your Deposit Has Been Approved ✓'
        : 'Your Deposit Has Been Rejected';

    const htmlContent =
      status === 'approved'
        ? `
        <h2>Deposit Approved!</h2>
        <p>Hello ${name},</p>
        <p>Your deposit of <strong>৳${amount.toLocaleString()}</strong> has been successfully approved.</p>
        <p>The amount has been added to your contribution record in the STEPS fund.</p>
        <p>Thank you for your participation!</p>
        <p>Best regards,<br/>STEPS Fund Management</p>
      `
        : `
        <h2>Deposit Status Update</h2>
        <p>Hello ${name},</p>
        <p>Your deposit of <strong>৳${amount.toLocaleString()}</strong> has been reviewed.</p>
        <p>Unfortunately, it has been rejected. Please contact the fund manager for more information.</p>
        <p>Best regards,<br/>STEPS Fund Management</p>
      `;

    // Send via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'STEPS Fund',
          email: 'noreply@stepsfund.local',
        },
        to: [
          {
            email: to,
            name: name,
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', result);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: response.status }
      );
    }

    console.log('Email sent successfully:', { to, name, status });
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Email service error:', error);
    return NextResponse.json(
      { error: 'Email service error' },
      { status: 500 }
    );
  }
}
