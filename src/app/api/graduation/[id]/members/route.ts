import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log('POST request received', id);
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

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

        // Only project leader can add members
        if (project.leaderId !== user.id) {
            return new NextResponse('Only project leader can add members', { status: 403 });
        }

        // Check if user is already a member of another project
        const existingMember = await prisma.graduationProjectMember.findFirst({
            where: {
                userId: userId,
                graduationProjectId: {
                    not: id
                }
            }
        });

        if (existingMember) {
            return new NextResponse('User is already a member of another project', { status: 400 });
        }

        // Check if user is already a member of this project
        const isAlreadyMember = project.members.some(member => member.userId === userId);
        if (isAlreadyMember) {
            return new NextResponse('User is already a member of this project', { status: 400 });
        }
        let student = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!student) {
            return new NextResponse('Student not found', { status: 404 });
        }
        if (student.role !== 'STUDENT') {
            return new NextResponse('User is not a student', { status: 400 });
        }

        const member = await prisma.graduationProjectMember.create({
            data: {
                graduationProjectId: id,
                userId: student.id,
                role: 'MEMBER'
            },
            include: {
                user: true
            }
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error('Error adding project member:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
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
            where: { id: (await params).id },
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
                graduationProjectId: (await params).id,
                userId: userId
            }
        });

        return new NextResponse('Member removed successfully', { status: 200 });
    } catch (error) {
        console.error('Error removing project member:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 