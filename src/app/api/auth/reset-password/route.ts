import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken, validatePasswordResetToken, hashPassword } from '@/lib/auth/utils';
import { sendEmail, getPasswordResetTemplate } from '@/lib/email/service';

// Request password reset
const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { email } = requestResetSchema.parse(body);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json(
        { message: 'If an account exists, a password reset email will be sent' },
        { status: 200 }
      );
    }
    
    // Generate reset token
    const resetToken = await generatePasswordResetToken(user.id);
    
    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`;
    
    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password - RemySales',
        html: getPasswordResetTemplate(user.name || 'there', resetUrl),
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

// Reset password with token
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { token, password } = resetPasswordSchema.parse(body);
    
    // Validate token
    const resetToken = await validatePasswordResetToken(token);
    
    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });
    
    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { used: true },
    });
    
    // Delete all other password reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id },
      },
    });
    
    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}