import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'
// GET /api/students
export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const departmentId = searchParams.get("departmentId");
    const studentId = searchParams.get("studentId");
    const role = searchParams.get("role");
    const professorId = searchParams.get("professorId");
    const isNotJoinedGraduation = searchParams.get("isNotJoinedGraduation");
    let where: Prisma.UserWhereInput = {};
    if (departmentId) {
        where.departmentId = departmentId;
    }
    if (studentId) {
        where.id = studentId;
    }
    if (professorId) {
        where.enrollments = {
            some: {
                course: {
                    professorId,
                },
            },
        };
    }
    if (isNotJoinedGraduation) {
        where.GraduationProject = {
            none: {},
        };
        where.GraduationProjectMember = {
            none: {},
        };
    }
    if (role) {
        where.role = role as UserRole;
    }
    try {
        const students = await prisma.user.findMany({
            where,
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
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const student = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                role: 'STUDENT',
                departmentId: body.departmentId,
                isVerified: body.isVerified,
            },
        })
        return NextResponse.json(student)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إضافة الطالب' }, { status: 500 })
    }
} 