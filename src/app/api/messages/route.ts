import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/messages
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: session.user.id },
                    { receiverId: session.user.id },
                ],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(messages)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب الرسائل' }, { status: 500 })
    }
}

// POST /api/messages
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
        }

        const body = await request.json()
        const message = await prisma.message.create({
            data: {
                content: body.content,
                senderId: session.user.id,
                receiverId: body.receiverId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        })

        return NextResponse.json(message)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إرسال الرسالة' }, { status: 500 })
    }
} 