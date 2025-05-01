import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const exam = await prisma.exam.findUnique({ where: { id }, include: { course: { include: { enrollments: { include: { student: { select: { id: true, name: true, department: true } } } } } }, professor: true, results: { include: { student: { include: { department: true } } } } } });
        return NextResponse.json(exam);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { title, description, duration, type, startTime, endTime } = await request.json();
        const exam = await prisma.exam.update({ where: { id }, data: { title, description, duration, type, startTime, endTime } });
        return NextResponse.json(exam);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.exam.delete({ where: { id } });
        return NextResponse.json({ message: "Exam deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
    }
}