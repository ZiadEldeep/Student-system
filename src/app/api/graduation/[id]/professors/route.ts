import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, ProfessorProjectStatus } from '@prisma/client';
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { professorId } = body;

        if (!professorId) {
            return new NextResponse('Missing professor ID', { status: 400 });
        }

        const project = await prisma.graduationProject.findUnique({
            where: { id: params.id },
            include: {
                professor: true
            }
        });

        if (!project) {
            return new NextResponse('Project not found', { status: 404 });
        }

        // Check if professor is already assigned
        const isProfessorAssigned = project.professor.some(p => p.professorId === professorId);
        if (isProfessorAssigned) {
            return new NextResponse('Professor is already assigned to this project', { status: 400 });
        }

        // Add professor to project
        const updatedProject = await prisma.graduationProject.update({
            where: { id: params.id },
            data: {
                professor: {
                    create: {
                        professorId: professorId,
                        status: 'PENDING'
                    }
                }
            },
            include: {
                professor: {
                    include: {
                        professor: true
                    }
                }
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error adding professor to project:', error);
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

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const project = await prisma.graduationProject.findUnique({
            where: { id: params.id },
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

        // Only project leader can remove members
        if (project.leaderId !== user.id) {
            return new NextResponse('Only project leader can remove members', { status: 403 });
        }

        // Cannot remove the leader
        if (project.leaderId === userId) {
            return new NextResponse('Cannot remove the project leader', { status: 400 });
        }

        await prisma.graduationProjectMember.deleteMany({
            where: {
                graduationProjectId: params.id,
                userId: userId
            }
        });

        return new NextResponse('Member removed successfully', { status: 200 });
    } catch (error) {
        console.error('Error removing project member:', error);
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
        const { status } = await req.json();
        if (!status) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const project = await prisma.graduationProject.findUnique({
            where: { id: id },
            include: {
                professor: true
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
        if (user.role !== 'PROFESSOR') {
            return new NextResponse('Only professors can update professor', { status: 403 });
        }

        const professorProject = await prisma.professorProject.findFirst({
            where: {
                professorId: user.id,
                projectId: id
            }
        });
        if (!professorProject) {
            return new NextResponse('Professor project not found', { status: 404 });
        }
        const updatedProfessorProject = await prisma.professorProject.update({
            where: { id: professorProject.id },
            data: {
                status: status as ProfessorProjectStatus
            }
        });
        const updatedProject = await prisma.graduationProject.findUnique({
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

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating professor:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const { notes } = await req.json();
        if (!notes) {
            return new NextResponse('Missing required fields', { status: 400 });
        }
        const professorProject = await prisma.professorProject.findFirst({
            where: {
                professorId: session.user.id,
                projectId: id
            }
        });
        if (!professorProject) {
            return new NextResponse('Professor project not found', { status: 404 });
        }
        const updatedProject = await prisma.graduationProject.update({
            where: { id: id },
            data: {
                notes: notes
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
        console.error('Error adding professor notes:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}