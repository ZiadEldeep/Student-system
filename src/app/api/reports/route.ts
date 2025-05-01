import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get users statistics
        const users = await prisma.user.groupBy({
            by: ['role'],
            _count: true,
        });

        const usersStats = {
            total: users.reduce((acc, curr) => acc + curr._count, 0),
            students: users.find(u => u.role === 'STUDENT')?._count || 0,
            professors: users.find(u => u.role === 'PROFESSOR')?._count || 0,
            admins: users.find(u => u.role === 'ADMIN')?._count || 0,
        };

        // Get departments statistics
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

        const departmentsStats = {
            total: departments.length,
            list: departments.map(dept => ({
                id: dept.id,
                name: dept.name,
                code: dept.code,
                studentsCount: dept._count.users,
                professorsCount: dept._count.users,
            })),
        };

        // Get courses statistics
        const courses = await prisma.course.findMany({
            include: {
                department: true,
                professor: true,
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        const coursesStats = {
            total: courses.length,
            list: courses.map(course => ({
                id: course.id,
                name: course.name,
                code: course.code,
                credits: course.credits,
                department: course.department.name,
                professor: course.professor.name,
                studentsCount: course._count.enrollments,
            })),
        };

        // Get exams statistics
        const exams = await prisma.exam.findMany({
            include: {
                course: true,
                _count: {
                    select: {
                        results: true,
                    },
                },
            },
        });

        const examsStats = {
            total: exams.length,
            list: exams.map(exam => ({
                id: exam.id,
                title: exam.title,
                course: exam.course.name,
                type: exam.type,
                startTime: exam.startTime,
                endTime: exam.endTime,
                studentsCount: exam._count.results,
            })),
        };

        // Get graduation projects statistics
        const projects = await prisma.graduationProject.findMany({
            include: {
                leader: true,
                _count: {
                    select: {
                        members: true,
                        professor: true,
                    },
                },
            },
        });

        const projectsStats = {
            total: projects.length,
            pending: projects.filter(p => p.status === 'PENDING').length,
            approved: projects.filter(p => p.status === 'APPROVED').length,
            rejected: projects.filter(p => p.status === 'REJECTED').length,
            list: projects.map(project => ({
                id: project.id,
                title: project.title,
                status: project.status,
                leader: project?.leader?.name,
                membersCount: project._count.members,
                professorsCount: project._count.professor,
            })),
        };

        return NextResponse.json({
            users: usersStats,
            departments: departmentsStats,
            courses: coursesStats,
            exams: examsStats,
            graduationProjects: projectsStats,
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 