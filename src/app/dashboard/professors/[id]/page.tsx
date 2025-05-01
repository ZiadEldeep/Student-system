"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from "@mui/material";
import { IconEdit, IconMessage } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface Professor {
    id: string;
    name: string;
    email: string;
    department: {
        id: string;
        name: string;
    };
    courses: Course[];
    exams: Exam[];
    GraduationProject: GraduationProject[];
}

interface Course {
    id: string;
    name: string;
    code: string;
    description: string;
    enrollments: Enrollment[];
}

interface Enrollment {
    id: string;
    student: {
        id: string;
        name: string;
    };
    grade: number | null;
    status: string;
}

interface Exam {
    id: string;
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    results: ExamResult[];
}

interface ExamResult {
    id: string;
    score: number;
    student: {
        id: string;
        name: string;
    };
}

interface GraduationProject {
    id: string;
    title: string;
    description: string;
    status: string;
    student?: {
        id: string;
        name: string;
    };
}

export default function ProfessorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [professor, setProfessor] = useState<Professor | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const { id } = use(params);
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        fetchProfessor();
        fetchDepartments();
    }, [status, router, id]);

    const fetchProfessor = async () => {
        try {
            const response = await fetch(`/api/professors/${id}`);
            const data = await response.json();
            setProfessor(data);
        } catch (error) {
            console.error('Error fetching professor:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleOpenEditDialog = () => {
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleSaveProfile = async () => {
        try {
            const response = await fetch(`/api/professors/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: professor?.name,
                    email: professor?.email,
                    departmentId: professor?.department.id,
                }),
            });

            if (response.ok) {
                handleCloseEditDialog();
                fetchProfessor();
            }
        } catch (error) {
            console.error('Error updating professor:', error);
        }
    };

    if (loading || !professor) {
        return <div>جاري التحميل...</div>;
    }

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                    gap: 3
                }}>
                    <Box>
                        <Card sx={{ bgcolor: '#184271', color: 'white' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        margin: '0 auto 20px',
                                        bgcolor: 'white',
                                        color: '#184271',
                                        fontSize: '3rem',
                                    }}
                                >
                                    {professor.name.charAt(0)}
                                </Avatar>
                                <Typography variant="h5" gutterBottom>
                                    {professor.name}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {professor.email}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {professor.department.name}
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<IconEdit />}
                                    onClick={handleOpenEditDialog}
                                    sx={{
                                        mt: 2,
                                        bgcolor: 'white',
                                        color: '#184271',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        },
                                    }}
                                >
                                    تعديل الملف الشخصي
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Paper sx={{ p: 3 }}>
                            <Tabs
                                value={tabValue}
                                onChange={(e, newValue) => setTabValue(newValue)}
                                sx={{ mb: 3 }}
                            >
                                <Tab label="المقررات الدراسية" />
                                <Tab label="الامتحانات" />
                                <Tab label="مشاريع التخرج" />
                            </Tabs>

                            {tabValue === 0 && (
                                <List>
                                    {professor.courses.map((course) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="h6">
                                                                {course.name}
                                                            </Typography>
                                                            <Chip
                                                                label={`${course.enrollments.length} طالب`}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {course.code} - {course.description}
                                                            </Typography>
                                                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>الطالب</TableCell>
                                                                            <TableCell>الدرجة</TableCell>
                                                                            <TableCell>الحالة</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {course.enrollments.map((enrollment) => (
                                                                            <TableRow key={enrollment.id}>
                                                                                <TableCell>{enrollment.student.name}</TableCell>
                                                                                <TableCell>
                                                                                    {enrollment.grade !== null ? enrollment.grade : 'لم يتم التقييم'}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Chip
                                                                                        label={enrollment.status === 'ENROLLED' ? 'متحصل' : 'غير متحصل'}
                                                                                        color={enrollment.status === 'ENROLLED' ? 'success' : 'warning'}
                                                                                        size="small"
                                                                                    />
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider />
                                        </motion.div>
                                    ))}
                                </List>
                            )}

                            {tabValue === 1 && (
                                <List>
                                    {professor.exams.map((exam) => (
                                        <motion.div
                                            key={exam.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="h6">
                                                                {exam.title}
                                                            </Typography>
                                                            <Chip
                                                                label={`${exam.results.length} طالب`}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {exam.type} - من {new Date(exam.startTime).toLocaleString()} إلى {new Date(exam.endTime).toLocaleString()}
                                                            </Typography>
                                                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>الطالب</TableCell>
                                                                            <TableCell>الدرجة</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {exam.results.map((result) => (
                                                                            <TableRow key={result.id}>
                                                                                <TableCell>{result.student.name}</TableCell>
                                                                                <TableCell>{result.score}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider />
                                        </motion.div>
                                    ))}
                                </List>
                            )}

                            {tabValue === 2 && (
                                <List>
                                    {professor.GraduationProject.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="h6">
                                                                {project.title}
                                                            </Typography>
                                                            <Chip
                                                                label={project.status}
                                                                color={
                                                                    project.status === 'AVAILABLE' ? 'success' :
                                                                        project.status === 'IN_PROGRESS' ? 'warning' :
                                                                            project.status === 'COMPLETED' ? 'primary' : 'default'
                                                                }
                                                                size="small"
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {project.description}
                                                            </Typography>
                                                            {project.student && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="subtitle2" color="text.secondary">
                                                                        الطالب المسؤول:
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {project.student.name}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider />
                                        </motion.div>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Box>

            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="الاسم"
                            value={professor.name}
                            onChange={(e) => setProfessor({ ...professor, name: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="البريد الإلكتروني"
                            value={professor.email}
                            onChange={(e) => setProfessor({ ...professor, email: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <Select
                            fullWidth
                            label="القسم"
                            value={professor.department.id}
                            onChange={(e) => setProfessor({
                                ...professor,
                                department: {
                                    ...professor.department,
                                    id: e.target.value
                                }
                            })}
                            sx={{ mb: 2 }}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>إلغاء</Button>
                    <Button onClick={handleSaveProfile} variant="contained" sx={{ bgcolor: '#184271' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 