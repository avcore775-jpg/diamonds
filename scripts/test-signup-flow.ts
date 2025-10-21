import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_B34pYNKb_J4M3novWjKeZj2SgZS4D4Vf7');

async function testSignupEmail() {
  try {
    console.log('🚀 Testing Full Signup Email Flow')
    console.log('==================================\n')
    
    // This is your Resend account email - the only one that works in test mode
    const testEmail = 'avcore775@gmail.com';
    
    console.log(`📧 Sending signup verification email to: ${testEmail}`)
    console.log('(This is the only email that works in Resend test mode)\n')
    
    const verificationUrl = `http://localhost:3001/api/auth/verify-email?token=test-token-123`;
    
    const htmlContent = `
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
              <h1>Welcome to Luxe Diamonds!</h1>
            </div>
            <div class="content">
              <h2>Hi Test User,</h2>
              <p>Thank you for signing up with Luxe Diamonds. To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0ABAB5;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Luxe Diamonds. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const data = await resend.emails.send({
      from: 'Luxe Diamonds <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Verify your email - Luxe Diamonds',
      html: htmlContent
    });
    
    if (data.error) {
      console.error('❌ Email sending failed:');
      console.error(data.error);
    } else {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check your Gmail inbox (avcore775@gmail.com)');
      console.log('📋 Email ID:', data.data?.id);
      console.log('\n📌 IMPORTANT: In test mode, Resend only sends to your account email.');
      console.log('   To send to other emails, you need to verify a domain.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:');
    console.error(error);
  }
}

console.log('Testing Resend Email Service with your account email...\n');
testSignupEmail();