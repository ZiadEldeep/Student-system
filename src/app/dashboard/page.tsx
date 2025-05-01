"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Box,
    Grid,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Skeleton,
} from "@mui/material";
import {
    IconBook,
    IconUsers,
    IconChartBar,
    IconMessage,
    IconCertificate,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import StudentDashboard from "@/components/student/studentDashboard";
import ProfessorDashboard from "@/components/professors/professorsDashboard";
import AdminDashboard from "@/components/admin/adminDashboard";


export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);
    if (status === "loading") {
        return <Skeleton variant="rectangular" height={100} />;
    }

    const getDashboardContent = () => {
        switch (session?.user?.role) {
            case "ADMIN":
                return <AdminDashboard adminId={session?.user?.id as string} />;
            case "STUDENT":
                return <StudentDashboard studentId={session?.user?.id as string} />;
            case "PROFESSOR":
                return <ProfessorDashboard professorId={session?.user?.id as string} />;

            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    مرحباً بك، {session?.user?.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    لوحة التحكم - {session?.user?.role === "ADMIN" ? "المدير" : session?.user?.role === "PROFESSOR" ? "الأستاذ" : "الطالب"}
                </Typography>
            </Box>
            {getDashboardContent()}
        </DashboardLayout>
    );
} 