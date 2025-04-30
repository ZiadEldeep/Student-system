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
                return (
                    <Grid container spacing={3}>
                        <Grid component="div" className="grid-cols-6 max-sm:grid-cols-12" >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        إحصائيات سريعة
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <IconUsers />
                                            </ListItemIcon>
                                            <ListItemText primary="عدد الطلاب" secondary="250" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <IconBook />
                                            </ListItemIcon>
                                            <ListItemText primary="عدد المواد" secondary="45" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <IconMessage />
                                            </ListItemIcon>
                                            <ListItemText primary="الرسائل الجديدة" secondary="12" />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </motion.div>
                        </Grid>
                        <Grid component="div" className="grid-cols-6 max-sm:grid-cols-12" >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        المهام الأخيرة
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemText
                                                primary="تحديث بيانات الطلاب"
                                                secondary="قبل ساعتين"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="إضافة مواد جديدة"
                                                secondary="قبل 3 أيام"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="توزيع الجداول"
                                                secondary="قبل أسبوع"
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </motion.div>
                        </Grid>
                    </Grid>
                );
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