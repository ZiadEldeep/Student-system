import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses/[id]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const course = await prisma.course.findUnique({
            where: {
                id: (await params).id,
            },
            include: {
                department: {
                    include: {
                        users: {
                            where: {
                                role: "PROFESSOR",
                            },
                        },
                    },
                },
                professor: true,
                enrollments: {
                    include: {
                        student: true,
                        course: {
                            include: {
                                professor: true,
                            },
                        },
                    },
                },
                exams: {
                    include: {
                        results: {
                            include: {
                                student: true,
                            },
                        },
                    },
                },
            },
        })

        if (!course) {
            return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 })
        }

        return NextResponse.json(course)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب معلومات المادة' }, { status: 500 })
    }
}

// PUT /api/courses/[id]
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json()
        const course = await prisma.course.update({
            where: {
                id: (await params).id,
            },
            data: {
                name: body.name,
                code: body.code,
                description: body.description,
                credits: body.credits,
                departmentId: body.departmentId,
                professorId: body.professorId,
            },
        })
        return NextResponse.json(course)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في تحديث معلومات المادة' }, { status: 500 })
    }
}

// DELETE /api/courses/[id]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await prisma.course.delete({
            where: {
                id: (await params).id,
            },
        })
        return NextResponse.json({ message: 'تم حذف المادة بنجاح' })
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في حذف المادة' }, { status: 500 })
    }
} 