import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// POST /api/exams/[id]/results
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
        }

        // التحقق من أن المستخدم هو الدكتور المسؤول عن الامتحان أو الإداري
        const exam = await prisma.exam.findUnique({
            where: {
                id: (await params).id,
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
        const student = await prisma.user.findUnique({
            where: {
                id: studentId,
            },
        })

        if (!student) {
            return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 })
        }

        if (score < 0 || score > 100) {
            return NextResponse.json({ error: 'الدرجة يجب أن تكون بين 0 و 100' }, { status: 400 })
        }

        const result = await prisma.examResult.create({
            data: {
                score: score,
                studentId: student.id,
                examId: (await params).id,
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
        return NextResponse.json({ error: 'حدث خطأ في اضافة درجة الطالب' }, { status: 500 })
    }
}