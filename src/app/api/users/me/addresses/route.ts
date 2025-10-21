import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/users/me/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get addresses
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/users/me/addresses - Add new address
const createAddressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
  isDefault: z.boolean().optional(),
  name: z.string().min(2, 'Name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = createAddressSchema.parse(body);
    
    // If this should be the default address, unset other defaults
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          type: validatedData.type || 'SHIPPING',
        },
        data: { isDefault: false },
      });
    }
    
    // Check if this is the first address
    const addressCount = await prisma.address.count({
      where: { userId: session.user.id },
    });
    
    // Create address
    const address = await prisma.address.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        isDefault: validatedData.isDefault || addressCount === 0, // Make first address default
      },
    });
    
    return NextResponse.json(
      {
        message: 'Address added successfully',
        address,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Create address error:', error);
    return NextResponse.json(
      { error: 'Failed to add address' },
      { status: 500 }
    );
  }
}