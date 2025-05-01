import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// get tables
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    try {
        const table = await prisma.table.findUnique({
            where: { id },
        });
        return NextResponse.json(table);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get table' }, { status: 500 });
    }
}
//put table
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const { name, url, type, examId } = await request.json();
        if (type === 'EXAM') {
            const exam = await prisma.exam.findUnique({
                where: { id: examId },
            });
            if (!exam) {
                return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
            }
            const table = await prisma.table.update({
                where: { id },
                data: { name, url, type, examId: exam.id },
            });
            return NextResponse.json(table);
        } else {
            const table = await prisma.table.update({
                where: { id },
                data: { name, url, type },
            });
            return NextResponse.json(table);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
    }
}

//delete table
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        await prisma.table.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Table deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
    }
}
