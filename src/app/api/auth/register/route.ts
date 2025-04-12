import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        // التحقق من وجود المستخدم
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "البريد الإلكتروني مستخدم بالفعل" },
                { status: 400 }
            );
        }

        // تشفير كلمة المرور
        const hashedPassword = await hash(password, 10);

        // إنشاء المستخدم
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        return NextResponse.json(
            { message: "تم إنشاء الحساب بنجاح", user: { id: user.id, email: user.email, role: user.role } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in register route:", error);
        return NextResponse.json(
            { message: "حدث خطأ أثناء إنشاء الحساب" },
            { status: 500 }
        );
    }
} 