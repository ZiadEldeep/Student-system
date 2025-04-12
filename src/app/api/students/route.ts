import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/students
export async function GET() {
    try {
        const students = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
            },
            include: {
                department: true,
            },
        })
        return NextResponse.json(students)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب الطلاب' }, { status: 500 })
    }
}

// POST /api/students
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const student = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: body.password,
                role: 'STUDENT',
                departmentId: body.departmentId,
            },
        })
        return NextResponse.json(student)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إضافة الطالب' }, { status: 500 })
    }
} 