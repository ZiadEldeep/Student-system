import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/departments
export async function GET() {
    try {
        const departments = await prisma.department.findMany()
        return NextResponse.json(departments)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في جلب الأقسام' }, { status: 500 })
    }
}

// POST /api/departments
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const department = await prisma.department.create({
            data: {
                name: body.name,
                code: body.code,
            },
        })
        return NextResponse.json(department)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في إضافة القسم' }, { status: 500 })
    }
} 