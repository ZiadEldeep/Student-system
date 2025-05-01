import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course, Exam, Enrollment, User, ExamResult } from "@prisma/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
    Grid,
    Skeleton,
    Paper,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Alert,
    Button,
    Chip,
    Stack,
    LinearProgress,
    Tooltip,
    IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
type CourseWithEnrollments = Course & { enrollments: (Enrollment & { student: User })[] };
type ExamWithCourseId = Exam & { courseId: string, results: (ExamResult & { student: User })[] };

const fetchCourses = async (studentId: string): Promise<CourseWithEnrollments[]> => {
    const response = await axios.get(`/api/courses?studentId=${studentId}`);
    return response.data;
};

const fetchExams = async (courseIds: string[], studentId: string): Promise<ExamWithCourseId[]> => {
    const response = await axios.get(`/api/exams?courseIds=${courseIds.join(",")}&studentId=${studentId}`);
    return response.data;
};

export default function StudentDashboard({ studentId }: { studentId: string }) {
    const router = useRouter();
    let [progress, setProgress] = useState(0);
    const {
        data: courses,
        isLoading: isCoursesLoading,
        isError: isCoursesError,
        error: coursesError
    } = useQuery({
        queryKey: ["courses", studentId],
        queryFn: () => fetchCourses(studentId)
    });

    const {
        data: exams,
        isLoading: isExamsLoading,
        isError: isExamsError,
        refetch: refetchExams,
        error: examsError
    } = useQuery<ExamWithCourseId[]>({
        queryKey: ["exams", studentId, courses?.map(c => c.id)],
        enabled: !!courses?.length,
        queryFn: () => fetchExams(courses!.map(c => c.id), studentId)
    });

    const handleViewExam = (examId: string) => {
        router.push(`/dashboard/exams/${examId}`);
    };
    const calculateProgress = (courseId: string) => {
        const courseExams = exams?.filter(e => e.courseId === courseId);
        const totalExams = courseExams?.length || 0;
        const completedExams = courseExams?.filter(e => e.results.find(r => r.studentId === studentId) !== undefined).length || 0;
        setProgress(Math.round((completedExams / totalExams) * 100));
    };

    useEffect(() => {
        courses?.forEach(course => {
            calculateProgress(course.id);
        });
    }, [exams]);
    if (isCoursesLoading) {
        return <Skeleton variant="rectangular" height={400} />;
    }

    if (isCoursesError) {
        return <Alert severity="error">حدث خطأ في تحميل المواد: {(coursesError as Error).message}</Alert>;
    }
    return (
        <Box sx={{ p: 3 }}>
            {/* <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Professor Dashboard
            </Typography> */}

            <Grid container spacing={3}>
                {courses?.map(course => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={course.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {course.name}
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={5} sx={{ mb: 2 }}>
                                    <Chip
                                        icon={<EventIcon />}
                                        label={`${exams?.filter(e => e.courseId === course.id).length || 0} امتحانات`}
                                        variant="outlined"
                                        sx={{ fontSize: '12px', padding: '4px 8px' }}
                                        size="small"
                                    />
                                </Stack>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        التقدم في المادة
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>



                                <Accordion sx={{ mt: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>الامتحانات القادمة</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {isExamsLoading ? (
                                            <Typography variant="body2">جاري تحميل الامتحانات...</Typography>
                                        ) : (
                                            <List dense>
                                                {exams
                                                    ?.filter(exam => exam.courseId === course.id)
                                                    .map(exam => (
                                                        <ListItem
                                                            key={exam.id}
                                                        >
                                                            <ListItemText
                                                                primary={exam.title}
                                                                secondary={
                                                                    <Box sx={{ display: 'flex', gap: 1 }} component={"span"}>
                                                                        <Typography variant="caption">
                                                                            البدء: {format(new Date(exam.startTime), 'dd/MM/yyyy HH:mm', { locale: ar })}
                                                                        </Typography>
                                                                        <Typography variant="caption">
                                                                            الانتهاء: {format(new Date(exam.endTime), 'dd/MM/yyyy HH:mm', { locale: ar })}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                            />
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="View Exam">
                                                                    <IconButton edge="end" onClick={() => handleViewExam(exam.id)} size="small">
                                                                        <VisibilityIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </ListItem>
                                                    ))}
                                                {!exams?.some(e => e.courseId === course.id) && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        لا يوجد امتحانات مجدولة.
                                                    </Typography>
                                                )}
                                            </List>
                                        )}
                                    </AccordionDetails>
                                </Accordion>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PeopleIcon />}
                                    sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}
                                    onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                                >
                                    عرض بيانات المادة
                                </Button>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}