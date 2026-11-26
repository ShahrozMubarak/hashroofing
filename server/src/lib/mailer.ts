import { env } from '../config/env.js';

export type EmailDeliveryResult =
  | { delivered: true; status: 'sent'; providerId?: string }
  | { delivered: false; status: 'integration_pending'; error: string }
  | { delivered: false; status: 'delivery_failed'; error: string };

export async function sendCompanyEmail(params: {
  subject: string;
  text: string;
  replyTo?: string;
  to?: string;
}): Promise<EmailDeliveryResult> {
  const apiKey = env.RESEND_API_KEY.trim();
  const recipient = (params.to || env.CONTACT_RECIPIENT_EMAIL).trim();
  const sender = env.RESEND_FROM_EMAIL.trim();

  if (!apiKey || !recipient || !sender || sender.includes('your-verified-domain.com')) {
    return {
      delivered: false,
      status: 'integration_pending',
      error:
        'The contact form is not connected to the company inbox yet. Configure the email settings before accepting live inquiries.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        subject: params.subject,
        text: params.text,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return {
        delivered: false,
        status: 'delivery_failed',
        error:
          'We could not deliver your request right now. Please try again or contact the company directly.',
      };
    }
    const json = (await response.json().catch(() => ({}))) as { id?: string };
    return { delivered: true, status: 'sent', providerId: json.id };
  } catch {
    return {
      delivered: false,
      status: 'delivery_failed',
      error:
        'We could not deliver your request right now. Please try again or contact the company directly.',
    };
  }
}

