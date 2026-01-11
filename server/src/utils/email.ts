import nodemailer from 'nodemailer';
import { createLogger } from './logger';

const log = createLogger('email');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * Get email configuration from environment variables
 */
const getEmailConfig = (): EmailConfig | null => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from: from || user,
  };
};

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  const config = getEmailConfig();

  if (!config) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
};

/**
 * Check if email service is configured and available
 */
export const isEmailServiceAvailable = (): boolean => {
  return getEmailConfig() !== null;
};

/**
 * Send an email
 * @param options Email options (to, subject, html, text)
 * @returns Promise<boolean> true if sent successfully, false otherwise
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const config = getEmailConfig();
  const transporter = createTransporter();

  if (!config || !transporter) {
    log.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in environment.');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    log.info({ messageId: info.messageId, to: options.to }, 'Email sent successfully');
    return true;
  } catch (error) {
    log.error({ error, to: options.to }, 'Failed to send email');
    return false;
  }
};

/**
 * Send password reset email
 * @param email Recipient email address
 * @param resetToken Password reset token
 * @param frontendUrl Frontend URL for building reset link
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  frontendUrl: string
): Promise<boolean> => {
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>비밀번호 재설정</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #5a6fd6; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 비밀번호 재설정</h1>
        </div>
        <div class="content">
          <p>안녕하세요,</p>
          <p>Idea Manager 계정의 비밀번호 재설정을 요청하셨습니다.</p>
          <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>

          <div style="text-align: center;">
            <a href="${resetLink}" class="button">비밀번호 재설정</a>
          </div>

          <p>또는 아래 링크를 브라우저에 복사하여 붙여넣으세요:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-size: 14px;">
            ${resetLink}
          </p>

          <div class="warning">
            <strong>⚠️ 주의:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>이 링크는 1시간 후에 만료됩니다.</li>
              <li>비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하세요.</li>
              <li>계정 보안을 위해 이 링크를 다른 사람과 공유하지 마세요.</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>© Idea Manager - 아이디어 관리 플랫폼</p>
          <p>이 이메일은 자동으로 발송되었습니다.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
비밀번호 재설정

안녕하세요,

Idea Manager 계정의 비밀번호 재설정을 요청하셨습니다.

아래 링크를 클릭하여 새 비밀번호를 설정하세요:
${resetLink}

주의사항:
- 이 링크는 1시간 후에 만료됩니다.
- 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하세요.
- 계정 보안을 위해 이 링크를 다른 사람과 공유하지 마세요.

© Idea Manager - 아이디어 관리 플랫폼
  `;

  return sendEmail({
    to: email,
    subject: '[Idea Manager] 비밀번호 재설정 안내',
    html,
    text,
  });
};
