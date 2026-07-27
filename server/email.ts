/**
 * Email helper module using Resend.
 * Provides a simple interface for sending transactional emails.
 */
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Default sender – update once domain is verified in Resend
const DEFAULT_FROM = "PhysioFreiheit <noreply@go.physiofreiheit.de>";

export interface SendEmailOptions {
  /** Recipient email address */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** HTML body content */
  html?: string;
  /** Plain text body content (fallback) */
  text?: string;
  /** Sender address (defaults to noreply@go.physiofreiheit.de) */
  from?: string;
  /** Reply-to address */
  replyTo?: string;
  /** BCC recipients */
  bcc?: string | string[];
  /** CC recipients */
  cc?: string | string[];
  /** Custom tags for tracking */
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend.
 * 
 * Usage:
 * ```ts
 * import { sendEmail } from "./email";
 * 
 * await sendEmail({
 *   to: "kunde@example.com",
 *   subject: "Dein KI-Report ist fertig!",
 *   html: "<h1>Hallo!</h1><p>Dein Report ist bereit.</p>",
 * });
 * ```
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, from, replyTo, bcc, cc, tags } = options;

  try {
    const payload: Record<string, any> = {
      from: from || DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
    };
    if (html) payload.html = html;
    if (text) payload.text = text;
    if (replyTo) payload.replyTo = replyTo;
    if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
    if (tags) payload.tags = tags;

    if (!resend) {
      console.warn('[Email] Resend not configured (missing API key)');
      return { success: false, error: 'Resend not configured' };
    }
    const { data, error } = await resend.emails.send(payload as any);

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent to ${to} | Subject: ${subject} | ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Exception:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Verify the Resend API key is valid by fetching domains (send-only keys can't list API keys).
 */
export async function verifyResendApiKey(): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!resend) {
      return { valid: false, error: 'Resend not configured (missing API key)' };
    }
    const { data, error } = await resend.domains.list();
    if (error) {
      // "restricted_api_key" means the key is valid but send-only
      if (error.name === "restricted_api_key") {
        return { valid: true };
      }
      return { valid: false, error: error.message };
    }
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}
