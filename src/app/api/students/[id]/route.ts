import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const student = await prisma.user.findUnique({ where: { id, role: "STUDENT" } });
    return NextResponse.json(student);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { name, email, password, departmentId } = await request.json();
    const student = await prisma.user.update({ where: { id, role: "STUDENT" }, data: { name, email, password, departmentId } });
    return NextResponse.json(student);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const student = await prisma.user.delete({ where: { id, role: "STUDENT" } });
    return NextResponse.json(student);
}   