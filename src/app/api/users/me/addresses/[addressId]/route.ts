import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// PATCH /api/users/me/addresses/:addressId - Update address
const updateAddressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
  isDefault: z.boolean().optional(),
  name: z.string().min(2).optional(),
  street: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  postalCode: z.string().min(3).optional(),
  country: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { addressId } = params;
    const body = await request.json();
    
    // Validate input
    const validatedData = updateAddressSchema.parse(body);
    
    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    // If setting as default, unset other defaults
    if (validatedData.isDefault === true) {
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          type: validatedData.type || address.type,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
    }
    
    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: validatedData,
    });
    
    return NextResponse.json(
      {
        message: 'Address updated successfully',
        address: updatedAddress,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/me/addresses/:addressId - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { addressId } = params;
    
    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    // If deleting default address, make another one default
    if (address.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: {
          userId: session.user.id,
          id: { not: addressId },
          type: address.type,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      if (anotherAddress) {
        await prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }
    
    // Delete address
    await prisma.address.delete({
      where: { id: addressId },
    });
    
    return NextResponse.json(
      { message: 'Address deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}