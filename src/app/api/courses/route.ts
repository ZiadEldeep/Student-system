import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
// GET /api/courses
export async function GET(request: Request) {
    try {
        let { searchParams } = new URL(request.url);
        const departmentId = searchParams.get("departmentId");
        const professorId = searchParams.get("professorId");
        const studentId = searchParams.get("studentId");
        let where: Prisma.CourseWhereInput = {};
        if (departmentId) {
            where.departmentId = departmentId;
        }
        if (professorId) {
            where.professorId = professorId;
        }
        if (studentId) {
            where.enrollments = {
                some: {
                    studentId,
                },
            };
        }
        const courses = await prisma.course.findMany({
            where,
            include: {
                department: true,
                professor: true,
                enrollments: {
                    include: {
                        student: true,
                    },
                },
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
        console.log(body)
        const course = await prisma.course.create({
            data: {
                name: body.name,
                code: body.code,
                description: body.description,
                credits: parseInt(body.credits),
                department: {
                    connect: {
                        id: body.departmentId,
                    },
                },
                professor: {
                    connect: {
                        id: body.professorId,
                    },
                },
            },
        })
        return NextResponse.json(course)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إضافة المادة' }, { status: 500 })
    }
} 
