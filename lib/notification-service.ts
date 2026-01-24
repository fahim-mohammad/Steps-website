// lib/notification-service.ts
// Abstracted notification service supporting Email, SMS, WhatsApp

export type NotificationType = 'signup' | 'deposit' | 'loan' | 'profit' | 'reminder' | 'system';
export type NotificationMethod = 'email' | 'sms' | 'whatsapp';

export interface NotificationPayload {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  name: string;
  type: NotificationType;
  subject?: string;
  message: string;
  method: NotificationMethod;
  metadata?: Record<string, any>;
}

/**
 * Send notification via specified method
 * Supports Email, SMS, WhatsApp
 * APIs injected via environment variables
 */
export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    switch (payload.method) {
      case 'email':
        return await sendEmailNotification(payload);
      case 'sms':
        return await sendSMSNotification(payload);
      case 'whatsapp':
        return await sendWhatsAppNotification(payload);
      default:
        return { success: false, error: 'Unknown notification method' };
    }
  } catch (error) {
    console.error('Notification service error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send email notification via Brevo API
 */
async function sendEmailNotification(payload: NotificationPayload) {
  try {
    if (!payload.recipientEmail) {
      return { success: false, error: 'Email address required' };
    }

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: payload.recipientEmail,
        name: payload.name,
        subject: payload.subject || getDefaultSubject(payload.type),
        message: payload.message,
        type: payload.type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    const result = await response.json();
    console.log('✉️ Email sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send SMS notification
 * Placeholder - inject SMS API via environment variable
 */
async function sendSMSNotification(payload: NotificationPayload) {
  try {
    if (!payload.recipientPhone) {
      return { success: false, error: 'Phone number required' };
    }

    // Placeholder - will be replaced with real SMS API
    console.log('📱 SMS notification (placeholder):', {
      to: payload.recipientPhone,
      message: payload.message,
      type: payload.type,
    });

    return { success: true, messageId: 'sms_placeholder_' + Date.now() };
  } catch (error) {
    console.error('SMS notification error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send WhatsApp notification
 * Placeholder - inject WhatsApp API via environment variable
 */
async function sendWhatsAppNotification(payload: NotificationPayload) {
  try {
    if (!payload.recipientPhone) {
      return { success: false, error: 'Phone number required' };
    }

    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: payload.recipientPhone,
        name: payload.name,
        message: payload.message,
        type: payload.type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    const result = await response.json();
    console.log('💬 WhatsApp sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get default subject based on notification type
 */
function getDefaultSubject(type: NotificationType): string {
  const subjects: Record<NotificationType, string> = {
    signup: 'Welcome to STEPS Fund',
    deposit: 'Deposit Confirmation',
    loan: 'Loan Application Update',
    profit: 'Profit Distribution',
    reminder: 'Monthly Reminder',
    system: 'System Notification',
  };
  return subjects[type];
}

/**
 * Get default message based on type
 */
export function getNotificationTemplate(type: NotificationType, data: Record<string, any>, language: 'en' | 'bn' = 'en'): string {
  const templates = {
    en: {
      signup: `Welcome to STEPS Fund! Your account has been created successfully. You can now make deposits and apply for loans.`,
      deposit: `Your deposit of ৳${data.amount} has been ${data.status}. Thank you for your contribution!`,
      loan: `Your loan application for ৳${data.amount} has been ${data.status}. ${data.notes || ''}`,
      profit: `You have received a profit share of ৳${data.amount} from this month's distribution!`,
      reminder: `Reminder: The monthly contribution deadline is approaching. Please submit your deposit at your earliest convenience.`,
      system: data.message || 'System notification',
    },
    bn: {
      signup: `STEPS ফান্ডে আপনাকে স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন আপনি জমা এবং ঋণের জন্য আবেদন করতে পারেন।`,
      deposit: `আপনার ৳${data.amount} জমা ${data.status} হয়েছে। আপনার অবদানের জন্য ধন্যবাদ!`,
      loan: `আপনার ৳${data.amount} ঋণের আবেদন ${data.status} হয়েছে। ${data.notes || ''}`,
      profit: `এই মাসের বিতরণ থেকে আপনি ৳${data.amount} লাভ শেয়ার পেয়েছেন!`,
      reminder: `স্মরণ: মাসিক অবদান জমার সময়সীমা আসছে। অনুগ্রহ করে আপনার জমা যত তাড়াতাড়ি সম্ভব জমা দিন।`,
      system: data.message || 'সিস্টেম বিজ্ঞপ্তি',
    },
  };

  return templates[language][type];
}
