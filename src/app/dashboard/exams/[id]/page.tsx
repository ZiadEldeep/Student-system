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
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Grid,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    DialogContentText,
    Autocomplete,
    Skeleton,
} from "@mui/material";
import { IconEdit, IconTrash, IconClock, IconChartBar, IconPlus, IconEye } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Exam {
    id: string;
    title: string;
    description: string;
    duration: number;
    type: string;
    startTime: string;
    endTime: string;
    course: {
        id: string;
        name: string;
        code: string;
        enrollments: {
            student: {
                id: string;
                name: string;
            };
        }[];
        professor: {
            id: string;
            name: string;
        };
    };
    professor: {
        id: string;
        name: string;
    };
    results: ExamResult[];
}

interface ExamResult {
    id: string;
    score: number;
    student: {
        id: string;
        name: string;
        department: {
            id: string;
            name: string;
        };
    };
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession();
    const { id } = use(params);
    const router = useRouter();
    const [exam, setExam] = useState<Exam | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openScoreDialog, setOpenScoreDialog] = useState(false);
    const [openAddScoreDialog, setOpenAddScoreDialog] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
    const [score, setScore] = useState<number>(0);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        fetchExam();
    }, [status, router, id]);

    const fetchExam = async () => {
        try {
            const response = await fetch(`/api/exams/${id}`);
            const data = await response.json();
            setExam(data);
        } catch (error) {
            console.error('Error fetching exam:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditDialog = () => {
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleSaveExam = async () => {
        try {
            const response = await fetch(`/api/exams/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: exam?.title,
                    description: exam?.description,
                    duration: exam?.duration,
                    type: exam?.type,
                    startTime: exam?.startTime,
                    endTime: exam?.endTime,
                }),
            });

            if (response.ok) {
                handleCloseEditDialog();
                fetchExam();
            }
        } catch (error) {
            console.error('Error updating exam:', error);
        }
    };

    const handleDeleteExam = async () => {
        try {
            const response = await fetch(`/api/exams/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/dashboard/exams');
            }
        } catch (error) {
            console.error('Error deleting exam:', error);
        }
    };

    const handleOpenScoreDialog = (result: ExamResult) => {
        setSelectedResult(result);
        setScore(result.score);
        setOpenScoreDialog(true);
    };

    const handleCloseScoreDialog = () => {
        setOpenScoreDialog(false);
        setSelectedResult(null);
        setScore(0);
    };
    const handleCloseAddScoreDialog = () => {
        setOpenAddScoreDialog(false);
        setSelectedResult(null);
        setScore(0);
    };

    const handleAddScore = async () => {
        if (!selectedStudent) return;
        try {
            const response = await fetch(`/api/exams/${id}/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: score,
                    studentId: selectedStudent,
                }),
            });

            if (response.ok) {
                handleCloseAddScoreDialog();
                fetchExam();
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    };
    const handleSaveScore = async () => {
        if (!selectedResult) return;

        try {
            const response = await fetch(`/api/exams/${id}/results/${selectedResult.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: score,
                }),
            });

            if (response.ok) {
                handleCloseScoreDialog();
                fetchExam();
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    };

    const calculateStatistics = () => {
        if (!exam?.results.length) return null;

        const totalStudents = exam.results.length;
        const passedStudents = exam.results.filter(r => r.score >= 50).length;
        const failedStudents = totalStudents - passedStudents;
        const averageScore = exam.results.reduce((sum, r) => sum + r.score, 0) / totalStudents;
        const maxScore = Math.max(...exam.results.map(r => r.score));
        const minScore = Math.min(...exam.results.map(r => r.score));

        // تحضير البيانات للرسم البياني
        const scoreRanges = [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 0 },
            { range: '41-60', count: 0 },
            { range: '61-80', count: 0 },
            { range: '81-100', count: 0 },
        ];

        exam.results.forEach(result => {
            const score = result.score;
            if (score <= 20) scoreRanges[0].count++;
            else if (score <= 40) scoreRanges[1].count++;
            else if (score <= 60) scoreRanges[2].count++;
            else if (score <= 80) scoreRanges[3].count++;
            else scoreRanges[4].count++;
        });

        return {
            totalStudents,
            passedStudents,
            failedStudents,
            averageScore,
            maxScore,
            minScore,
            scoreRanges,
        };
    };

    const statistics = calculateStatistics();

    if (loading || !exam) {
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
                                    {exam.title}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    المادة: {exam.course.name} ({exam.course.code}) <IconEye size={20} style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/courses/${exam.course.id}`)} />
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    الدكتور: {exam.professor.name}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    نوع الامتحان: {exam.type === 'QUIZ' ? 'اختبار قصير' : 'امتحان نهائي'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <IconClock size={20} />
                                    <Typography variant="body1">
                                        المدة: {exam.duration} دقيقة
                                    </Typography>
                                </Box>
                                <Typography variant="body1" gutterBottom>
                                    من: {new Date(exam.startTime).toLocaleString()}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    إلى: {new Date(exam.endTime).toLocaleString()}
                                </Typography>
                                {canEdit && (
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<IconPlus />}
                                            onClick={() => setOpenAddScoreDialog(true)}
                                            sx={{
                                                bgcolor: 'white',
                                                color: '#184271',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: 1,
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                },
                                            }}
                                        >
                                            اضافة درجة طالب
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<IconEdit />}
                                            onClick={handleOpenEditDialog}
                                            sx={{
                                                bgcolor: 'white',
                                                color: '#184271',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: 1,
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                },
                                            }}
                                        >
                                            تعديل
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<IconTrash />}
                                            onClick={handleDeleteExam}
                                            sx={{
                                                bgcolor: 'error.main',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: 1,
                                                '&:hover': {
                                                    bgcolor: 'error.dark',
                                                },
                                            }}
                                        >
                                            حذف
                                        </Button>
                                    </Box>
                                )}
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
                                <Tab label="وصف الامتحان" />
                                <Tab label="نتائج الطلاب" />
                            </Tabs>

                            {tabValue === 0 && (
                                <Box>
                                    <Typography variant="body1" paragraph>
                                        {exam.description}
                                    </Typography>
                                </Box>
                            )}

                            {tabValue === 1 && (
                                <>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>الطالب</TableCell>
                                                    <TableCell>القسم</TableCell>
                                                    <TableCell>الدرجة</TableCell>
                                                    {canEdit && <TableCell>الإجراءات</TableCell>}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {exam.results.map((result) => (
                                                    <motion.tr
                                                        key={result.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <TableCell>{result.student.name}</TableCell>
                                                        <TableCell>{result.student.department?.name}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={result.score}
                                                                color={result.score >= 50 ? 'success' : 'error'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        {canEdit && (
                                                            <TableCell>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenScoreDialog(result)}
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
                                        <Box sx={{ mt: 4 }}>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconChartBar size={24} />
                                                إحصائيات الامتحان
                                            </Typography>
                                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Card>
                                                        <CardContent>
                                                            <Typography color="text.secondary" gutterBottom>
                                                                عدد الطلاب
                                                            </Typography>
                                                            <Typography variant="h4">
                                                                {statistics.totalStudents}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Card>
                                                        <CardContent>
                                                            <Typography color="text.secondary" gutterBottom>
                                                                الناجحون
                                                            </Typography>
                                                            <Typography variant="h4" color="success.main">
                                                                {statistics.passedStudents}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Card>
                                                        <CardContent>
                                                            <Typography color="text.secondary" gutterBottom>
                                                                الراسبون
                                                            </Typography>
                                                            <Typography variant="h4" color="error.main">
                                                                {statistics.failedStudents}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Card>
                                                        <CardContent>
                                                            <Typography color="text.secondary" gutterBottom>
                                                                متوسط الدرجات
                                                            </Typography>
                                                            <Typography variant="h4">
                                                                {statistics.averageScore.toFixed(2)}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Card>
                                                        <CardContent>
                                                            <Typography color="text.secondary" gutterBottom>
                                                                أعلى درجة
                                                            </Typography>
                                                            <Typography variant="h4" color="success.main">
                                                                {statistics.maxScore}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Card>
                                                        <CardContent>
                                                            <Typography color="text.secondary" gutterBottom>
                                                                أقل درجة
                                                            </Typography>
                                                            <Typography variant="h4" color="error.main">
                                                                {statistics.minScore}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            </Grid>

                                            <Paper sx={{ p: 3, height: 400 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    توزيع الدرجات
                                                </Typography>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={statistics.scoreRanges}
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
                                        </Box>
                                    )}
                                </>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Box>

            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>تعديل معلومات الامتحان</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="عنوان الامتحان"
                            value={exam.title}
                            onChange={(e) => setExam({ ...exam, title: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="وصف الامتحان"
                            value={exam.description}
                            onChange={(e) => setExam({ ...exam, description: e.target.value })}
                            multiline
                            rows={4}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="مدة الامتحان (بالدقائق)"
                            type="number"
                            value={exam.duration}
                            onChange={(e) => setExam({ ...exam, duration: parseInt(e.target.value) })}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>نوع الامتحان</InputLabel>
                            <Select
                                value={exam.type}
                                label="نوع الامتحان"
                                onChange={(e) => setExam({ ...exam, type: e.target.value })}
                            >
                                <MenuItem value="QUIZ">اختبار قصير</MenuItem>
                                <MenuItem value="FINAL">امتحان نهائي</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="وقت البداية"
                            type="datetime-local"
                            value={new Date(exam.startTime).toISOString().slice(0, 16)}
                            onChange={(e) => setExam({ ...exam, startTime: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="وقت النهاية"
                            type="datetime-local"
                            value={new Date(exam.endTime).toISOString().slice(0, 16)}
                            onChange={(e) => setExam({ ...exam, endTime: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>إلغاء</Button>
                    <Button onClick={handleSaveExam} variant="contained" sx={{ bgcolor: '#184271' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openScoreDialog} onClose={handleCloseScoreDialog}>
                <DialogTitle>تعديل درجة الطالب</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        تعديل درجة الطالب: {selectedResult?.student.name}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="الدرجة"
                        type="number"
                        fullWidth
                        value={score}
                        onChange={(e) => setScore(parseFloat(e.target.value))}
                        inputProps={{ min: 0, max: 100, step: 0.5 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseScoreDialog}>إلغاء</Button>
                    <Button onClick={handleSaveScore} variant="contained" sx={{ bgcolor: '#184271' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openAddScoreDialog} onClose={handleCloseAddScoreDialog} maxWidth="sm" fullWidth>
                <DialogTitle>إضافة درجة طالب</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        sx={{ mb: 2, mt: 2 }}
                        options={exam.course.enrollments.map(r => r.student)}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="الطالب"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                        onChange={(event, value) => {
                            setSelectedStudent(value?.id || null);
                        }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>الدرجة</InputLabel>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="الدرجة"
                            type="number"
                            fullWidth
                            value={score}
                            onChange={(e) => setScore(parseFloat(e.target.value))}
                            inputProps={{ min: 0, max: 100, step: 0.5 }}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddScoreDialog}>إلغاء</Button>
                    <Button onClick={handleAddScore} variant="contained" sx={{ bgcolor: '#184271' }}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 