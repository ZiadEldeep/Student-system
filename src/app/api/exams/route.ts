import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
export async function GET(request: Request) {
    try {
        let { searchParams } = new URL(request.url);
        const courseIds = searchParams.get("courseIds");
        const professorId = searchParams.get("professorId");
        const studentId = searchParams.get("studentId");
        let where: Prisma.ExamWhereInput = {};
        if (courseIds) {
            where.courseId = { in: courseIds.split(",") };
        }
        if (professorId) {
            where.professorId = professorId;
        }
        if (studentId) {
            where.course = {
                enrollments: { some: { studentId } },
            };
        }
        const exams = await prisma.exam.findMany({
            where,
        });
        return NextResponse.json(exams);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const exam = await prisma.exam.create({ data: body });
    return NextResponse.json(exam);
}

export async function PUT(request: Request) {
    const body = await request.json();
    const exam = await prisma.exam.update({ where: { id: body.id }, data: body });
    return NextResponse.json(exam);
}

export async function DELETE(request: Request) {
    const body = await request.json();
    const exam = await prisma.exam.delete({ where: { id: body.id } });
    return NextResponse.json(exam);
}
