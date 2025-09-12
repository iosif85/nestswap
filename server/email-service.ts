import nodemailer from 'nodemailer';

const MAIL_CONFIG = {
  host: process.env.MAIL_SERVER,
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // Use TLS
  auth: process.env.MAIL_USERNAME ? {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  } : undefined,
};

const DEFAULT_SENDER = process.env.MAIL_DEFAULT_SENDER || 'NestSwap <no-reply@nestswap.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      if (MAIL_CONFIG.host && MAIL_CONFIG.auth) {
        this.transporter = nodemailer.createTransport(MAIL_CONFIG as any);
      } else {
        console.log('Email service: No SMTP configuration found, emails will be logged to console');
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  private async sendEmail(to: string, subject: string, html: string, text?: string) {
    const mailOptions = {
      from: DEFAULT_SENDER,
      to,
      subject,
      html,
      text,
    };

    if (this.transporter) {
      try {
        const result = await this.transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;
      } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
      }
    } else {
      // Log email to console if no transporter is configured
      console.log('\n=== EMAIL LOG ===');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html}`);
      console.log(`Text: ${text || 'No text version'}`);
      console.log('================\n');
    }
  }

  async sendEmailVerification(email: string, name: string, token: string) {
    const verificationUrl = `${FRONTEND_URL}/#/verify-email?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2f5d50;">Welcome to NestSwap!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for signing up for NestSwap. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2f5d50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with NestSwap, please ignore this email.</p>
        <p>Happy swapping!<br>The NestSwap Team</p>
      </div>
    `;

    const text = `
      Welcome to NestSwap!
      
      Hi ${name},
      
      Thank you for signing up for NestSwap. Please verify your email address by visiting:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with NestSwap, please ignore this email.
      
      Happy swapping!
      The NestSwap Team
    `;

    await this.sendEmail(email, 'Verify your NestSwap account', html, text);
  }

  async sendPasswordReset(email: string, name: string, token: string) {
    const resetUrl = `${FRONTEND_URL}/#/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2f5d50;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your NestSwap account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2f5d50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>Best regards,<br>The NestSwap Team</p>
      </div>
    `;

    const text = `
      Password Reset Request
      
      Hi ${name},
      
      You requested a password reset for your NestSwap account. Visit the following link to set a new password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
      
      Best regards,
      The NestSwap Team
    `;

    await this.sendEmail(email, 'Reset your NestSwap password', html, text);
  }

  async sendWelcomeMessage(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2f5d50;">Welcome to the NestSwap Community!</h1>
        <p>Hi ${name},</p>
        <p>Your email has been verified and your NestSwap account is now active! 🎉</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>🏠 <strong>List your property</strong> - Share your caravan or cabin with the community</li>
          <li>🔍 <strong>Browse properties</strong> - Discover amazing places for your next getaway</li>
          <li>💬 <strong>Connect with owners</strong> - Message property owners about potential swaps</li>
          <li>⭐ <strong>Upgrade your membership</strong> - Unlock unlimited swap requests for just £10/year</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}" 
             style="background-color: #2f5d50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Exploring
          </a>
        </div>
        <p>Need help getting started? Check out our <a href="${FRONTEND_URL}/#/help" style="color: #2f5d50;">help center</a> or reply to this email.</p>
        <p>Happy swapping!<br>The NestSwap Team</p>
      </div>
    `;

    const text = `
      Welcome to the NestSwap Community!
      
      Hi ${name},
      
      Your email has been verified and your NestSwap account is now active!
      
      Here's what you can do next:
      - List your property - Share your caravan or cabin
      - Browse properties - Discover amazing places
      - Connect with owners - Message about potential swaps
      - Upgrade your membership - Unlock unlimited swaps for £10/year
      
      Visit ${FRONTEND_URL} to get started.
      
      Happy swapping!
      The NestSwap Team
    `;

    await this.sendEmail(email, 'Welcome to NestSwap! Your account is ready', html, text);
  }
}

export const emailService = new EmailService();