import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// get tables
export async function GET() {
    try {
        const tables = await prisma.table.findMany();
        return NextResponse.json(tables);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get tables' }, { status: 500 });
    }
}
//post table
export async function POST(request: NextRequest) {
    const { name, url, type, examId } = await request.json();
    if (type === 'EXAM') {
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
        });
        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }
        const table = await prisma.table.create({
            data: { name, url, type, examId: exam.id },
        });
        return NextResponse.json(table);
    } else {
        const table = await prisma.table.create({
            data: { name, url, type },
        });
        return NextResponse.json(table);
    }
}