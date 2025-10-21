# Email Testing Guide

## Current Setup
The application uses Resend for email authentication, but it's currently in test mode with limitations.

## How to Test Authentication

### Option 1: Use Console Magic Links (Recommended for Testing)
1. Go to http://localhost:3001/auth/signin
2. Enter any email address
3. Click "Sign in with Email"
4. **Check your terminal/console** where the dev server is running
5. You'll see the magic link printed like this:
   ```
   🔐 MAGIC LINK FOR TESTING
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Email: your@email.com
   
   🔗 Click this link to sign in:
   http://localhost:3001/api/auth/callback/email?...
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
6. Copy and paste the link into your browser to sign in

### Option 2: Use Verified Email (avcore775@gmail.com)
- Resend will actually send emails to: `avcore775@gmail.com`
- This is the only email that will receive actual emails in test mode

## Admin Access
To test admin features:
1. Sign in with any email using the console magic link method
2. Update the user role in the database:
   ```bash
   npx prisma studio
   ```
3. Find your user and change role from `CUSTOMER` to `ADMIN`
4. Refresh the page to see admin features

## Production Setup
For production, you'll need to:
1. Verify your domain at https://resend.com/domains
2. Once verified, Resend can send to any email address
3. Remove or disable the console logging in production

## Why Console Logging?
During development, this approach:
- Allows testing with any email without domain verification
- Speeds up development (no waiting for emails)
- Works offline
- Avoids email delivery issues