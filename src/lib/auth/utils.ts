import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT Token management
export function generateToken(payload: any, expiresIn: string = '7d'): string {
  const secret = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this';
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this';
  return jwt.verify(token, secret);
}

// Email verification token
export async function generateEmailVerificationToken(userId: string, email: string) {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerification.create({
    data: {
      token,
      userId,
      email,
      expiresAt,
    },
  });

  return token;
}

// Password reset token
export async function generatePasswordResetToken(userId: string) {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  await prisma.passwordReset.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

// Validate email verification token
export async function validateEmailVerificationToken(token: string) {
  const verificationToken = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    throw new Error('Invalid verification token');
  }

  if (verificationToken.used) {
    throw new Error('Token has already been used');
  }

  if (new Date() > verificationToken.expiresAt) {
    throw new Error('Token has expired');
  }

  return verificationToken;
}

// Validate password reset token
export async function validatePasswordResetToken(token: string) {
  const resetToken = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    throw new Error('Invalid reset token');
  }

  if (resetToken.used) {
    throw new Error('Token has already been used');
  }

  if (new Date() > resetToken.expiresAt) {
    throw new Error('Token has expired');
  }

  return resetToken;
}

// Create session
export async function createSession(userId: string) {
  const sessionToken = nanoid(32);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  return session;
}

// Get session
export async function getSession(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (new Date() > session.expires) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}