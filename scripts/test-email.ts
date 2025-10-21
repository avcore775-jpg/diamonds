import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_B34pYNKb_J4M3novWjKeZj2SgZS4D4Vf7');

async function testEmail() {
  try {
    console.log('Testing Resend email service...')
    console.log('API Key:', process.env.RESEND_API_KEY ? 'Set from env' : 'Using hardcoded')
    
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.argv[2] || 'test@example.com',
      subject: 'Test Email from Luxe Diamonds',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify that Resend is working correctly.</p>
        <p>If you received this, the email service is functioning!</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Response:', data);
    
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error);
    
    // Check for common issues
    if (error instanceof Error) {
      if (error.message.includes('API')) {
        console.log('\n💡 Possible issue: Invalid API key');
      }
      if (error.message.includes('domain')) {
        console.log('\n💡 Possible issue: Domain not verified or invalid sender');
      }
    }
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx tsx scripts/test-email.ts <your-email>');
  console.log('Example: npx tsx scripts/test-email.ts user@gmail.com');
} else {
  console.log(`Sending test email to: ${email}`);
  testEmail();
}