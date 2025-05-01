import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// PUT /api/exams/[id]/results/[resultId]
export async function PUT(
    request: Request,
    { params }: { params: { id: string; resultId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
        }

        // التحقق من أن المستخدم هو الدكتور المسؤول عن الامتحان أو الإداري
        const exam = await prisma.exam.findUnique({
            where: {
                id: params.id,
            },
            select: {
                professorId: true,
            },
        })

        if (!exam) {
            return NextResponse.json({ error: 'الامتحان غير موجود' }, { status: 404 })
        }

        if (session.user.role !== 'ADMIN' && session.user.id !== exam.professorId) {
            return NextResponse.json({ error: 'غير مصرح لك بتعديل درجات هذا الامتحان' }, { status: 403 })
        }

        const body = await request.json()
        const { score, studentId } = body

        if (score < 0 || score > 100) {
            return NextResponse.json({ error: 'الدرجة يجب أن تكون بين 0 و 100' }, { status: 400 })
        }
        const student = await prisma.user.findUnique({
            where: {
                id: studentId,
            },
        })
        if (!student) {
            return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 })
        }
        const enrollment = await prisma.enrollment.update({
            where: {
                studentId_courseId: {
                    studentId: studentId,
                    courseId: params.id,
                },
            },
            data: {
                grade: { increment: +score },
            },
            include: {
                course: true,
            },
        })
        if (!enrollment) {
            return NextResponse.json({ error: 'الطالب غير مسجل في هذا المقرر' }, { status: 404 })
        }

        const result = await prisma.examResult.update({
            where: {
                id: params.resultId,
            },
            data: {
                score: score,
            },
            include: {
                student: {
                    select: {
                        name: true,
                        department: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error updating exam result:', error)
        return NextResponse.json({ error: 'حدث خطأ في تحديث درجة الطالب' }, { status: 500 })
    }
} 