import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { compare } from "bcrypt"
import { User, UserRole } from "@prisma/client"


declare module "next-auth" {
    interface Session {
        user: User
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: User
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "البريد الإلكتروني", type: "email" },
                password: { label: "كلمة المرور", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("الرجاء إدخال البريد الإلكتروني وكلمة المرور")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                })

                if (!user) {
                    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
                }

                const isPasswordValid = await compare(credentials.password, user.password)

                if (!isPasswordValid) {
                    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                if ('role' in user) {
                    token.role = user.role as UserRole
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.role = token.role as UserRole
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
} 