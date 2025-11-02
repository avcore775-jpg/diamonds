import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Prevent admin from changing their own role
    if (session.user.id === resolvedParams.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { role, isActive } = body

    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    const user = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}