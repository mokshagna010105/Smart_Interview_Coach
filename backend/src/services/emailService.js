import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT) || 587,
        secure: env.SMTP_SECURE === true || Number(env.SMTP_PORT) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      });
      logger.info(`SMTP Email Transporter configured successfully (${env.SMTP_HOST}:${env.SMTP_PORT})`);
    } else {
      logger.info('ℹ️ SMTP credentials not configured. Using development console email logger.');
    }
  }

  /**
   * Send Password Reset Email
   * @param {string} toEmail
   * @param {string} resetToken
   */
  async sendPasswordResetEmail(toEmail, resetToken) {
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const subject = 'InterviewAI — Password Reset Request';
    const textContent = `Hello,\n\nYou requested to reset your password for your InterviewAI account.\n\nPlease click the following link to choose a new password:\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request a password reset, please disregard this email.\n\nBest regards,\nThe InterviewAI Team`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">InterviewAI Password Reset</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">You recently requested to reset the password for your InterviewAI account.</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 12px;">This reset link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.EMAIL_FROM || '"InterviewAI" <no-reply@interviewai.com>',
          to: toEmail,
          subject,
          text: textContent,
          html: htmlContent
        });
        logger.info(`Password reset email delivered via SMTP to ${toEmail}`);
      } catch (err) {
        logger.error(`Failed to deliver email via SMTP to ${toEmail}: ${err.message}`);
      }
    } else {
      logger.info(`📧 [DEV EMAIL] Password reset email for ${toEmail}: ${resetUrl}`);
    }
  }
}

export const emailService = new EmailService();
export default emailService;
