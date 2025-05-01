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
    Grid,
    FormControl,
    InputLabel,
    DialogContentText,
    Skeleton,
} from "@mui/material";
import { IconEdit, IconTrash, IconChartBar, IconUser, IconBook, IconClock, IconEye } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Course {
    id: string;
    name: string;
    code: string;
    description: string;
    credits: number;
    department: {
        id: string;
        name: string;
        users: {
            id: string;
            name: string;
            role: string;
        }[];
    };
    professor: {
        id: string;
        name: string;
    };
    enrollments: Enrollment[];
    exams: Exam[];
}

interface Enrollment {
    id: string;
    student: {
        id: string;
        name: string;
        department: {
            id: string;
            name: string;
        };
    };
    course: {
        professor: {
            id: string;
            name: string;
        };
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

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = use(params);
    const [course, setCourse] = useState<Course | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openGradeDialog, setOpenGradeDialog] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
    const [grade, setGrade] = useState<number>(0);
    const [tabValue, setTabValue] = useState(0);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [professors, setProfessors] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<{
        totalStudents: number;
        passedStudents: number;
        failedStudents: number;
        averageGrade: number;
        gradeRanges: { range: string; count: number }[];
    } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        fetchCourse();
        fetchDepartments();
        fetchProfessors();
    }, [status, router, id]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${id}`);
            const data = await response.json();
            setCourse(data);
        } catch (error) {
            console.error('Error fetching course:', error);
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

    const fetchProfessors = async () => {
        try {
            const response = await fetch('/api/professors');
            const data = await response.json();
            setProfessors(data);
        } catch (error) {
            console.error('Error fetching professors:', error);
        }
    };

    const handleOpenEditDialog = () => {
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleOpenGradeDialog = (enrollment: Enrollment) => {
        setSelectedEnrollment(enrollment);
        setGrade(enrollment.grade || 0);
        setOpenGradeDialog(true);
    };

    const handleCloseGradeDialog = () => {
        setOpenGradeDialog(false);
        setSelectedEnrollment(null);
        setGrade(0);
    };

    const handleSaveGrade = async () => {
        if (!selectedEnrollment) return;

        try {
            const response = await fetch(`/api/enrollments/${selectedEnrollment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grade: grade,
                }),
            });

            if (response.ok) {
                handleCloseGradeDialog();
                fetchCourse();
            }
        } catch (error) {
            console.error('Error updating grade:', error);
        }
    };

    const calculateStatistics = () => {
        if (!course?.enrollments.length) return null;

        const totalStudents = course.enrollments.length;
        const totalExams = course.exams.length
        const passedStudents = course.exams.filter(e => e.results.length > 0).length;
        const failedStudents = totalStudents - passedStudents;
        const averageGrade = course.exams.reduce((sum, e) => sum + (e.results.reduce((sum, r) => sum + (r.score || 0), 0) / e.results.length), 0) / course.exams.length;
        // تحضير البيانات للرسم البياني
        const gradeRanges = [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 0 },
            { range: '41-60', count: 0 },
            { range: '61-80', count: 0 },
            { range: '81-100', count: 0 },
        ];

        course.exams.forEach(exam => {
            exam.results.forEach(result => {
                const grade = result.score || 0;
                if (grade <= 20) gradeRanges[0].count++;
                else if (grade <= 40) gradeRanges[1].count++;
                else if (grade <= 60) gradeRanges[2].count++;
                else if (grade <= 80) gradeRanges[3].count++;
                else gradeRanges[4].count++;
            });
        });

        setStatistics({
            totalStudents,
            passedStudents,
            failedStudents,
            averageGrade,
            gradeRanges,
        });
    };
    const handleSaveCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: course?.name,
                    code: course?.code,
                    description: course?.description,
                    credits: course?.credits,
                    departmentId: course?.department.id,
                    professorId: course?.professor.id,
                }),
            });

            if (response.ok) {
                handleCloseEditDialog();
                fetchCourse();
            }
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };
    useEffect(() => {
        calculateStatistics();
    }, [course]);



    if (loading || !course) {
        return <Skeleton variant="rectangular" height={100} />;
    }

    const isProfessor = session?.user?.role === 'PROFESSOR';
    const isAdmin = session?.user?.role === 'ADMIN';
    const canEdit = isProfessor || isAdmin;

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
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    {course.name}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    رمز المادة: {course.code}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    عدد الساعات: {course.credits}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    القسم: {course.department.name}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    الأستاذ: {course.professor.name}
                                </Typography>
                                {canEdit && (
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<IconEdit />}
                                            onClick={handleOpenEditDialog}
                                            sx={{
                                                bgcolor: 'white',
                                                color: '#184271',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: 2,
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                },
                                            }}
                                        >
                                            تعديل
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {statistics && (
                            <Card sx={{ mt: 3, bgcolor: '#184271', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconChartBar size={24} />
                                        إحصائيات المادة
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Typography variant="body2" color="white">
                                                عدد الطلاب
                                            </Typography>
                                            <Typography variant="h6" color="white">
                                                {statistics.totalStudents}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Typography variant="body2" color="white">
                                                الناجحون
                                            </Typography>
                                            <Typography variant="h6" color="white">
                                                {statistics.passedStudents}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Typography variant="body2" color="white">
                                                الراسبون
                                            </Typography>
                                            <Typography variant="h6" color="white">
                                                {statistics.failedStudents}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Typography variant="body2" color="white">
                                                متوسط الدرجات
                                            </Typography>
                                            <Typography variant="h6" color="white">
                                                {statistics.averageGrade.toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}
                    </Box>

                    <Box>
                        <Paper sx={{ p: 3 }}>
                            <Tabs
                                value={tabValue}
                                onChange={(e, newValue) => setTabValue(newValue)}
                                sx={{ mb: 3 }}
                            >
                                <Tab label="وصف المادة" />
                                {canEdit && <Tab label="الطلاب المسجلين" />}
                                {canEdit && <Tab label="الامتحانات" />}
                            </Tabs>

                            {tabValue === 0 && (
                                <Box>
                                    <Typography variant="body1" paragraph>
                                        {course.description}
                                    </Typography>
                                </Box>
                            )}

                            {tabValue === 1 && canEdit && (
                                <>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>الطالب</TableCell>
                                                    <TableCell>القسم</TableCell>
                                                    <TableCell>الدرجة</TableCell>
                                                    <TableCell>الحالة</TableCell>
                                                    {canEdit && <TableCell>الإجراءات</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {course.enrollments.map((enrollment) => (
                                                    <motion.tr
                                                        key={enrollment.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <TableCell>{enrollment.student.name}</TableCell>
                                                        <TableCell>{enrollment.student.department?.name}</TableCell>
                                                        <TableCell>
                                                            {enrollment.grade !== null ? (
                                                                <Chip
                                                                    label={enrollment.grade}
                                                                    color={enrollment.grade >= 50 ? 'success' : 'error'}
                                                                    size="small"
                                                                />
                                                            ) : (
                                                                'لم يتم التقييم'
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={enrollment.status === 'ENROLLED' ? 'متحصل' : 'غير متحصل'}
                                                                color={enrollment.status === 'ENROLLED' ? 'success' : 'warning'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        {canEdit && (
                                                            <TableCell>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenGradeDialog(enrollment)}
                                                                >
                                                                    <IconEdit size={20} />
                                                                </IconButton>
                                                            </TableCell>
                                                        )}
                                                    </motion.tr>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {statistics && (
                                        <Paper sx={{ p: 3, mt: 4, height: 400 }}>
                                            <Typography variant="h6" gutterBottom>
                                                توزيع الدرجات
                                            </Typography>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={statistics.gradeRanges}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="range" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" name="عدد الطلاب" fill="#184271" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Paper>
                                    )}
                                </>
                            )}

                            {tabValue === 2 && canEdit && (
                                <List>
                                    {course.exams.map((exam) => (
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
                                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                                <Chip
                                                                    label={`${exam.results.length} طالب`}
                                                                    color="primary"
                                                                    size="small"
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => router.push(`/dashboard/exams/${exam.id}`)}
                                                                >
                                                                    <IconEye size={20} />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="white">
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
                                                                                <TableCell>
                                                                                    <Chip
                                                                                        label={result.score}
                                                                                        color={result.score >= 50 ? 'success' : 'error'}
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
                        </Paper>
                    </Box>
                </Box>
            </Box>

            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>تعديل معلومات المادة</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="اسم المادة"
                            value={course.name}
                            onChange={(e) => setCourse({ ...course, name: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="رمز المادة"
                            value={course.code}
                            onChange={(e) => setCourse({ ...course, code: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="وصف المادة"
                            value={course.description}
                            onChange={(e) => setCourse({ ...course, description: e.target.value })}
                            multiline
                            rows={4}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="عدد الساعات"
                            type="number"
                            value={course.credits}
                            onChange={(e) => setCourse({ ...course, credits: parseInt(e.target.value) })}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>القسم</InputLabel>
                            <Select
                                value={course.department.id}
                                label="القسم"
                                onChange={(e) => setCourse({
                                    ...course,
                                    department: {
                                        ...course.department,
                                        id: e.target.value
                                    }
                                })}
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>الأستاذ</InputLabel>
                            <Select
                                value={course.professor.id}
                                label="الأستاذ"
                                onChange={(e) => setCourse({
                                    ...course,
                                    professor: {
                                        ...course.professor,
                                        id: e.target.value
                                    }
                                })}
                            >
                                {professors.map((prof) => (
                                    <MenuItem key={prof.id} value={prof.id}>
                                        {prof.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>إلغاء</Button>
                    <Button onClick={handleSaveCourse} variant="contained" sx={{ bgcolor: '#184271' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openGradeDialog} onClose={handleCloseGradeDialog}>
                <DialogTitle>تعديل درجة الطالب</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        تعديل درجة الطالب: {selectedEnrollment?.student.name}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="الدرجة"
                        type="number"
                        fullWidth
                        value={grade}
                        onChange={(e) => setGrade(parseFloat(e.target.value))}
                        inputProps={{ min: 0, max: 100, step: 0.5 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGradeDialog}>إلغاء</Button>
                    <Button onClick={handleSaveGrade} variant="contained" sx={{ bgcolor: '#184271' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 