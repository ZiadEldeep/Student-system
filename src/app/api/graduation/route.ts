import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GraduationProject } from '@prisma/client';
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                GraduationProject: {
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
                },
                GraduationProjectMember: {
                    include: {
                        graduationProject: {
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
                        }
                    }
                }
            }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        let projects: GraduationProject[] = [];
        if (user.role === 'ADMIN') {
            projects = await prisma.graduationProject.findMany({
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
        } else if (user.role === 'PROFESSOR') {
            projects = await prisma.graduationProject.findMany({
                where: {
                    professor: {
                        some: {
                            professorId: user.id
                        }
                    }
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
        } else if (user.role === 'STUDENT') {
            const studentProjects = [
                ...user.GraduationProject,
                ...user.GraduationProjectMember.map(member => member.graduationProject)
            ];
            projects = [...new Set(studentProjects)];
        }

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching graduation projects:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { title, description } = body;

        if (!title || !description) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user || user.role !== 'STUDENT') {
            return new NextResponse('Only students can create projects', { status: 403 });
        }

        const project = await prisma.graduationProject.create({
            data: {
                title,
                description,
                leaderId: user.id,
                members: {
                    create: {
                        userId: user.id,
                        role: 'LEADER'
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error creating graduation project:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 