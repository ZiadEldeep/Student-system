import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/professors/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
            const body = await request.json()
        const { id } = await params
        const professor = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                name: body.name,
                email: body.email,
                departmentId: body.departmentId,
                ...(body.password && { password: body.password }),
            },
        })
        return NextResponse.json(professor)
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في تعديل بيانات الأستاذ' }, { status: 500 })
    }
}

// DELETE /api/professors/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.user.delete({
            where: {
                id: id,
            },
        })
        return NextResponse.json({ message: 'تم حذف الأستاذ بنجاح' })
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في حذف الأستاذ' }, { status: 500 })
    }
} 