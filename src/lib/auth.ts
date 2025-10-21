import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth/utils"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        // Verify password
        const isValid = await verifyPassword(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account has been deactivated")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified
        }
      }
    })
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "ADMIN" | "MANAGER" | "SUPPORT"
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-this",
}

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    role: "CUSTOMER" | "ADMIN" | "MANAGER" | "SUPPORT"
    emailVerified: Date | null
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: "CUSTOMER" | "ADMIN" | "MANAGER" | "SUPPORT"
      emailVerified: Date | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "CUSTOMER" | "ADMIN" | "MANAGER" | "SUPPORT"
    emailVerified: Date | null
  }
}