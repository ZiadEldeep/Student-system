import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt'
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const student = await prisma.user.findUnique({ where: { id, role: "STUDENT" } });
    return NextResponse.json(student);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; 
    const {password,...updateData} = await request.json();
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
    }

    const student = await prisma.user.update({ 
        where: { id, role: "STUDENT" }, 
        data: updateData 
    });
    return NextResponse.json(student);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const student = await prisma.user.delete({ where: { id, role: "STUDENT" } });
    return NextResponse.json(student);
}   