import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
// GET /api/courses
export async function GET(request: Request) {
    try {
        let { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const studentId = searchParams.get("studentId");
        let where: Prisma.EnrollmentWhereInput = {};
        if (courseId) {
            where.courseId = courseId;
        }
        if (studentId) {
            where.studentId = studentId;
        }
        const enrollments = await prisma.enrollment.findMany({
            where,
            include: {
                course: true,
                student: true,
            },
        })
        return NextResponse.json(enrollments)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب المواد' }, { status: 500 })
    }
}

// POST /api/enrollments
export async function POST(request: Request) {
    try {
        const { courseId, studentIds } = await request.json()
        let findEnrollments = await prisma.enrollment.findMany({
            where: {
                courseId,
                studentId: { in: studentIds },
            },
        })
        let newStudentIds = studentIds.filter((studentId: string) => !findEnrollments.some((enrollment) => enrollment.studentId === studentId))
        const enrollment = newStudentIds.length > 0 ? await prisma.enrollment.createMany({
            data: newStudentIds.map((studentId: string) => ({
                courseId,
                studentId,
            })),
        }) : null

        return NextResponse.json(enrollment)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إضافة المادة' }, { status: 500 })
    }
} 
