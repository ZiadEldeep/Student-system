import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const project = await prisma.graduationProject.findUnique({
            where: { id: id },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                professor: {
                    include: {
                        professor: true
                    }
                }
            }
        });

        if (!project) {
            return new NextResponse('Project not found', { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error fetching graduation project:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { title, description, status, notes, grade } = body;

        const project = await prisma.graduationProject.findUnique({
            where: { id: id },
            include: {
                members: true
            }
        });

        if (!project) {
            return new NextResponse('Project not found', { status: 404 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Only project leader can update title and description
        if (title || description) {
            if (project.leaderId !== user.id) {
                return new NextResponse('Only project leader can update project details', { status: 403 });
            }
        }

        // Only professors can update status, notes, and grade
        if (status || notes || grade) {
            if (user.role !== 'PROFESSOR') {
                return new NextResponse('Only professors can update project status and notes', { status: 403 });
            }
        }

        const updatedProject = await prisma.graduationProject.update({
            where: { id: id },
            data: {
                title,
                description,
                status,
                notes,
                grade
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                professor: {
                    include: {
                        professor: true
                    }
                }
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating graduation project:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const project = await prisma.graduationProject.findUnique({
            where: { id: params.id }
        });

        if (!project) {
            return new NextResponse('Project not found', { status: 404 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Only project leader can delete the project
        if (project.leaderId !== user.id) {
            return new NextResponse('Only project leader can delete the project', { status: 403 });
        }

        await prisma.graduationProject.delete({
            where: { id: params.id }
        });

        return new NextResponse('Project deleted successfully', { status: 200 });
    } catch (error) {
        console.error('Error deleting graduation project:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 