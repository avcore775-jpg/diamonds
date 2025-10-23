import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEmailVerificationToken } from '@/lib/auth/utils';
import { sendEmail, getWelcomeTemplate } from '@/lib/email/service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    // Validate token
    const verificationToken = await validateEmailVerificationToken(token);
    
    // Update user's email verification status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { 
        emailVerified: new Date(),
        email: verificationToken.email, // Update email if it was changed
      },
    });
    
    // Mark token as used
    await prisma.emailVerification.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });
    
    // Send welcome email
    try {
      await sendEmail({
        to: verificationToken.email,
        subject: 'Welcome to RemySales!',
        html: getWelcomeTemplate(verificationToken.user.name || 'there'),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    // Redirect to success page
    return NextResponse.redirect(
      new URL('/account?verified=true', request.nextUrl.origin)
    );
  } catch (error: any) {
    console.error('Email verification error:', error);
    
    // Redirect to error page with message
    const errorMessage = encodeURIComponent(error.message || 'Verification failed');
    return NextResponse.redirect(
      new URL(`/auth/error?error=${errorMessage}`, request.nextUrl.origin)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { message: 'If an account exists, a verification email will be sent' },
        { status: 200 }
      );
    }
    
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }
    
    // Check for existing unused token
    const existingToken = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });
    
    let token;
    
    if (existingToken) {
      token = existingToken.token;
    } else {
      // Generate new token
      const { generateEmailVerificationToken } = await import('@/lib/auth/utils');
      token = await generateEmailVerificationToken(user.id, user.email);
    }
    
    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/verify-email?token=${token}`;
    
    // Send verification email
    try {
      const { getEmailVerificationTemplate } = await import('@/lib/email/service');
      await sendEmail({
        to: user.email,
        subject: 'Verify your email - RemySales',
        html: getEmailVerificationTemplate(user.name || 'there', verificationUrl),
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}