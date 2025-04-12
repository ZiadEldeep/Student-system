import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses
export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                department: true,
                professor: true,
            },
        })
        return NextResponse.json(courses)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب المواد' }, { status: 500 })
    }
}

// POST /api/courses
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const course = await prisma.course.create({
            data: {
                name: body.name,
                code: body.code,
                description: body.description,
                credits: parseInt(body.credits),
                departmentId: body.departmentId,
                professorId: body.professorId,
            },
        })
        return NextResponse.json(course)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إضافة المادة' }, { status: 500 })
    }
} 