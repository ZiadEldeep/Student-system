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
    const { courseId, professorId, type, title, description, duration, startTime, endTime } = await request.json();
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const professor = await prisma.user.findUnique({ where: { id: professorId } });
    if (!professor) {
        return NextResponse.json({ error: "Professor not found" }, { status: 404 });
    }
    if (course.professorId !== professorId) {
        return NextResponse.json({ error: "You are not authorized to create an exam for this course" }, { status: 403 });
    }
    const exam = await prisma.exam.create({ data: { courseId: course.id, professorId: professor.id, type, title, description, duration, startTime: new Date(startTime), endTime: new Date(endTime) } });
    return NextResponse.json(exam);
}

export async function PUT(request: Request) {
    const { id, courseId, professorId, type, title, description, duration, startTime, endTime } = await request.json();
    const exam = await prisma.exam.update({ where: { id }, data: { courseId, professorId, type, title, description, duration, startTime: new Date(startTime), endTime: new Date(endTime) } });
    return NextResponse.json(exam);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    const exam = await prisma.exam.delete({ where: { id } });
    return NextResponse.json(exam);
}
