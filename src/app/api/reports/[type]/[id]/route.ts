import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { type, id } = await params;

        let updatedData;

        switch (type) {
            case 'departments':
                updatedData = await prisma.department.update({
                    where: { id },
                    data: {
                        name: body.name,
                        code: body.code,
                    },
                });
                break;

            case 'courses':
                updatedData = await prisma.course.update({
                    where: { id },
                    data: {
                        name: body.name,
                        code: body.code,
                        credits: parseInt(body.credits),
                    },
                });
                break;

            case 'exams':
                updatedData = await prisma.exam.update({
                    where: { id },
                    data: {
                        title: body.title,
                        type: body.type,
                        startTime: new Date(body.startTime),
                        endTime: new Date(body.endTime),
                    },
                });
                break;

            case 'graduationProjects':
                updatedData = await prisma.graduationProject.update({
                    where: { id },
                    data: {
                        title: body.title,
                        status: body.status,
                    },
                });
                break;

            default:
                return new NextResponse('Invalid type', { status: 400 });
        }

        return NextResponse.json(updatedData);
    } catch (error) {
        console.error('Error updating data:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 