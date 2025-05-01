import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/professors/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const professor = await prisma.user.findUnique({
            where: {
                id: params.id,
                role: 'PROFESSOR',
            },
            include: {
                department: true,
                courses: {
                    include: {
                        enrollments: {
                            include: {
                                student: true,
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
                GraduationProject: {
                    include: {
                        student: true,
                    },
                },
            },
        })

        if (!professor) {
            return NextResponse.json({ error: 'الأستاذ غير موجود' }, { status: 404 })
        }

        return NextResponse.json(professor)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب معلومات الأستاذ' }, { status: 500 })
    }
}

// PUT /api/professors/[id]
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const professor = await prisma.user.update({
            where: {
                id: params.id,
                role: 'PROFESSOR',
            },
            data: {
                name: body.name,
                email: body.email,
                departmentId: body.departmentId,
            },
        })
        return NextResponse.json(professor)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في تحديث معلومات الأستاذ' }, { status: 500 })
    }
}

// DELETE /api/professors/[id]
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.user.delete({
            where: {
                id: params.id,
                role: 'PROFESSOR',
            },
        })
        return NextResponse.json({ message: 'تم حذف الأستاذ بنجاح' })
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في حذف الأستاذ' }, { status: 500 })
    }
}
