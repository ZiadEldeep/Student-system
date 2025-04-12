import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/departments/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const department = await prisma.department.update({
            where: {
                id: id,
            },
            data: {
                name: body.name,
                code: body.code,
            },
        })
        return NextResponse.json(department)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في تعديل بيانات القسم' }, { status: 500 })
    }
}

// DELETE /api/departments/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.department.delete({
            where: {
                id: id,
            },
        })
        return NextResponse.json({ message: 'تم حذف القسم بنجاح' })
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في حذف القسم' }, { status: 500 })
    }
}
