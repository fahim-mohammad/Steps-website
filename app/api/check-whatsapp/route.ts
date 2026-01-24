import { NextRequest, NextResponse } from 'next/server';

/**
 * Initialize WhatsApp Phone Number ID environment variable
 * This is a utility endpoint to document the required setup
 */
export async function GET(request: NextRequest) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!phoneNumberId) {
    return NextResponse.json(
      {
        error: 'WHATSAPP_PHONE_NUMBER_ID not configured',
        setup: 'Add WHATSAPP_PHONE_NUMBER_ID to .env.local',
        format: 'WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_meta',
        docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api/',
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    configured: true,
    message: 'WhatsApp Phone Number ID is configured',
  });
}
