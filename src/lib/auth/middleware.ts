import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/utils';
import { prisma } from '@/lib/prisma';

export async function authenticateUser(request: NextRequest) {
  try {
    // Check for session token in cookies
    const sessionToken = request.cookies.get('session-token')?.value;
    
    if (!sessionToken) {
      // Check for Bearer token in Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      
      const token = authHeader.substring(7);
      const session = await getSession(token);
      return session?.user || null;
    }
    
    const session = await getSession(sessionToken);
    return session?.user || null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await authenticateUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Account has been deactivated' },
      { status: 403 }
    );
  }
  
  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await authenticateUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  return user;
}

// Helper to get current user from NextAuth session
export async function getCurrentUser(email: string | null | undefined) {
  if (!email) return null;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}