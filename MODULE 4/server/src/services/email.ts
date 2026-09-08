import dotenv from 'dotenv';

dotenv.config();

export async function sendTempPasswordEmail(
  toEmail: string,
  tempPassword: string,
  subject: string,
  heading: string
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'testingground1227@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'ConformalGuard';
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const loginUrl = `${appUrl}/developer/login`;

  if (!apiKey || apiKey === 'your-brevo-api-key-here') {
    throw new Error('BREVO_API_KEY is not configured or is using placeholder value.');
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6; max-width: 600px;">
      <h2 style="color: #0f172a; margin-top: 0;">${heading}</h2>
      <p>A temporary password has been issued for your ConformalGuard account.</p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none;">${loginUrl}</a></p>
        <p style="margin: 0 0 8px 0;"><strong>Account Email:</strong> ${toEmail}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 1.1em; letter-spacing: 0.5px;">${tempPassword}</code></p>
      </div>

      <p style="color: #64748b; font-size: 0.9em; margin-bottom: 24px;">
        <em>For security, you must change this temporary password immediately upon your first login.</em>
      </p>

      <div style="margin-top: 24px;">
        <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
          Go to Login
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px 0;" />
      <p style="font-size: 0.8em; color: #94a3b8; margin: 0;">
        If you did not request this action, please contact your security administrator immediately.
      </p>
    </div>
  `;

  const emailBody = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(emailBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown Brevo API error');
    throw new Error(`Brevo email delivery failed (status ${response.status}): ${errorText}`);
  }
}
