import { Resend } from 'resend';

// Log to debug
console.log('Initializing Resend with API key:', process.env.RESEND_API_KEY ? 'Found' : 'Missing');

const resend = new Resend(process.env.RESEND_API_KEY || 're_B34pYNKb_J4M3novWjKeZj2SgZS4D4Vf7');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Send email using Resend
export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const from = process.env.EMAIL_FROM || 'RemySales <onboarding@resend.dev>';
    
    // In test mode, redirect all emails to your account
    // This allows testing with any email address
    let actualRecipient = to;
    const isTestMode = !process.env.RESEND_DOMAIN_VERIFIED;
    
    if (isTestMode) {
      // Extract base email for variations like avcore775+test@gmail.com
      if (to.includes('avcore775') || to.includes('+')) {
        // Keep the original if it's already a variation of your email
        actualRecipient = to;
      } else {
        // Redirect other emails to your account for testing
        console.log(`📧 Test Mode: Redirecting email from ${to} to avcore775@gmail.com`);
        actualRecipient = 'avcore775@gmail.com';
      }
    }
    
    console.log('Attempting to send email:');
    console.log('  From:', from);
    console.log('  To (original):', to);
    console.log('  To (actual):', actualRecipient);
    console.log('  Subject:', subject);
    
    const data = await resend.emails.send({
      from,
      to: actualRecipient,
      subject: `${subject} ${actualRecipient !== to ? `(for ${to})` : ''}`,
      html,
    });

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error('Failed to send email');
  }
}

// Email templates
export function getEmailVerificationTemplate(name: string, verificationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ABAB5 0%, #089693 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0ABAB5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RemySales!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name || 'there'},</h2>
            <p>Thank you for signing up with RemySales. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0ABAB5;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 RemySales. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPasswordResetTemplate(name: string, resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ABAB5 0%, #089693 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0ABAB5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name || 'there'},</h2>
            <p>We received a request to reset the password for your RemySales account. Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0ABAB5;">${resetUrl}</p>
            <p>This link will expire in 2 hours.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 RemySales. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getWelcomeTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RemySales</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ABAB5 0%, #089693 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0ABAB5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RemySales!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your email has been successfully verified! We're thrilled to have you as part of the RemySales family.</p>
            <p>Start exploring our exquisite collection of diamond jewelry:</p>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/catalog" class="button">Shop Now</a>
            </div>
            <h3>What's Next?</h3>
            <ul>
              <li>Browse our curated collection of rings, necklaces, earrings, and bracelets</li>
              <li>Create your wishlist to save your favorite pieces</li>
              <li>Enjoy exclusive member offers and early access to new collections</li>
            </ul>
            <p>If you have any questions, our customer service team is here to help.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 RemySales. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}