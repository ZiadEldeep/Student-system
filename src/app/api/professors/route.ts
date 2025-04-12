import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/professors
export async function GET() {
    try {
        const professors = await prisma.user.findMany({
            where: {
                role: 'PROFESSOR',
            },
            include: {
                department: true,
            },
        })
        return NextResponse.json(professors)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب الأساتذة' }, { status: 500 })
    }
}

// POST /api/professors
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const professor = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: body.password,
                role: 'PROFESSOR',
                departmentId: body.departmentId,
            },
        })
        return NextResponse.json(professor)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إضافة الأستاذ' }, { status: 500 })
    }
} 