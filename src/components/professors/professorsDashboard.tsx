import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course, Exam, Enrollment, User } from "@prisma/client";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssessmentIcon from "@mui/icons-material/Assessment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import UploadIcon from "@mui/icons-material/Upload";
import { motion } from "framer-motion";
import { IconBook } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/navigation";
type CourseWithEnrollments = Course & { enrollments: (Enrollment & { student: User })[] };
type ExamWithCourseId = Exam & { courseId: string };

const fetchCourses = async (professorId: string): Promise<CourseWithEnrollments[]> => {
    const response = await axios.get(`/api/courses?professorId=${professorId}`);
    return response.data;
};

const fetchExams = async (courseIds: string[], professorId: string): Promise<ExamWithCourseId[]> => {
    const response = await axios.get(`/api/exams?courseIds=${courseIds.join(",")}&professorId=${professorId}`);
    return response.data;
};

export default function ProfessorDashboard({ professorId }: { professorId: string }) {
    const [openExamDialog, setOpenExamDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [examData, setExamData] = useState({
        title: "",
        description: "",
        duration: 60,
        type: "QUIZ",
        questions: [] as Array<{
            question: string;
            options: string[];
            correctAnswer: number;
        }>,
        startTime: "",
        endTime: ""
    });
    const router = useRouter();
    const {
        data: courses,
        isLoading: isCoursesLoading,
        isError: isCoursesError,
        error: coursesError
    } = useQuery({
        queryKey: ["courses", professorId],
        queryFn: () => fetchCourses(professorId)
    });

    const {
        data: exams,
        isLoading: isExamsLoading,
        isError: isExamsError,
        refetch: refetchExams,
        error: examsError
    } = useQuery({
        queryKey: ["exams", professorId, courses?.map(c => c.id)],
        enabled: !!courses?.length,
        queryFn: () => fetchExams(courses!.map(c => c.id), professorId)
    });

    const handleAddExam = (courseId: string) => {
        setSelectedCourse(courseId);
        setOpenExamDialog(true);
    };

    const handleCloseExamDialog = () => {
        setOpenExamDialog(false);
        setSelectedCourse(null);
        setExamData({
            title: "",
            description: "",
            duration: 60,
            type: "QUIZ",
            startTime: "",
            endTime: "",
            questions: []
        });
    };
    const handleViewStatistics = (courseId: string) => {
        // router.push(`/professors/statistics?courseId=${courseId}`);
    };
    const handleEditExam = (examId: string) => {
        // router.push(`/professors/edit-exam?examId=${examId}`);
    };
    const handleDeleteExam = async (examId: string) => {
        // router.push(`/professors/delete-exam?examId=${examId}`);
        try {
            await axios.delete(`/api/exams/${examId}`);
            refetchExams();
        } catch (error) {
            console.error("حدث خطأ في حذف الامتحان:", error);
        }
    };
    const handleViewExam = (examId: string) => {
        router.push(`/dashboard/exams/${examId}`);
    };
    const handleAddQuestion = () => {
        setExamData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0
                }
            ]
        }));
    };

    const handleSubmitExam = async () => {
        if (!selectedCourse) return;

        try {
            await axios.post("/api/exams", {
                courseId: selectedCourse,
                professorId: professorId,
                ...examData
            });
            handleCloseExamDialog();
            refetchExams();
        } catch (error) {
            console.error("حدث خطأ في إنشاء الامتحان:", error);
        }
    };

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
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="View Statistics">
                                            <IconButton onClick={() => handleViewStatistics(course.id)} size="small">
                                                <AssessmentIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Add MCQ Exam">
                                            <IconButton onClick={() => handleAddExam(course.id)} size="small">
                                                <UploadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>

                                <Stack direction="row" spacing={5} sx={{ mb: 2 }}>
                                    <Chip
                                        icon={<PeopleIcon />}
                                        label={`${course.enrollments.length} طلاب`}
                                        variant="outlined"
                                        sx={{ fontSize: '12px', padding: '4px 8px' }}
                                        size="small"
                                    />
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
                                        value={70}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>

                                <Accordion sx={{ mt: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>الطلاب المتسجلين</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>الطالب</TableCell>
                                                        <TableCell>الايدي</TableCell>
                                                        <TableCell>البريد الالكتروني</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {course.enrollments.map((enrollment) => (
                                                        <TableRow key={enrollment.student.id}>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Avatar sx={{ width: 24, height: 24 }}>
                                                                        {enrollment.student.name.charAt(0)}
                                                                    </Avatar>
                                                                    {enrollment.student.name}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{enrollment.student.id}</TableCell>
                                                            <TableCell>{enrollment.student.email}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>

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
                                                                    <Stack direction="row" spacing={1}>
                                                                        <Typography variant="caption">
                                                                            Start: {new Date(exam.startTime).toLocaleString()}
                                                                        </Typography>
                                                                        <Typography variant="caption">
                                                                            End: {new Date(exam.endTime).toLocaleString()}
                                                                        </Typography>
                                                                    </Stack>
                                                                }
                                                            />
                                                            <Stack direction="row" spacing={1}>
                                                                <Tooltip title="Edit Exam">
                                                                    <IconButton edge="end" onClick={() => handleEditExam(exam.id)} size="small">
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete Exam">
                                                                    <IconButton edge="end" onClick={() => handleDeleteExam(exam.id)} size="small">
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
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

            <Dialog open={openExamDialog} onClose={handleCloseExamDialog} maxWidth="md" fullWidth>
                <DialogTitle>اضافة امتحان</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="عنوان الامتحان"
                            fullWidth
                            value={examData.title}
                            onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <TextField
                            label="وصف الامتحان"
                            fullWidth
                            value={examData.description}
                            onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <FormControl fullWidth>
                            <InputLabel>نوع الامتحان</InputLabel>
                            <Select
                                label="نوع الامتحان"
                                value={examData.type}
                                onChange={(e) => setExamData(prev => ({ ...prev, type: e.target.value as string }))}
                            >
                                <MenuItem value="QUIZ">QUIZ</MenuItem>
                                <MenuItem value="FINAL">FINAL</MenuItem>
                            </Select>

                        </FormControl>
                        {/* <FormControl fullWidth>
                            <InputLabel>المادة</InputLabel>
                            <Select
                                value={selectedCourse}
                                label="المادة"
                                onChange={(e) => setSelectedCourse(e.target.value as string)}
                            >
                                {courses?.map(course => (
                                    <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
                                ))}
                            </Select>

                        </FormControl> */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <InputLabel>موعد البدء</InputLabel>
                                    <FormControl fullWidth>
                                        <TextField
                                            type="datetime-local"
                                            value={examData.startTime}
                                            onChange={(e) => setExamData(prev => ({ ...prev, startTime: e.target.value }))}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <InputLabel>موعد الانتهاء</InputLabel>
                                    <FormControl fullWidth>
                                        <TextField
                                            type="datetime-local"
                                            value={examData.endTime}
                                            onChange={(e) => setExamData(prev => ({ ...prev, endTime: e.target.value }))}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel>المدة (دقائق)</InputLabel>
                            <Select
                                value={examData.duration}
                                label="المدة (دقائق)"
                                onChange={(e) => setExamData(prev => ({ ...prev, duration: e.target.value as number }))}
                            >
                                <MenuItem value={30}>30 دقيقة</MenuItem>
                                <MenuItem value={60}>60 دقيقة</MenuItem>
                                <MenuItem value={90}>90 دقيقة</MenuItem>
                                <MenuItem value={120}>120 دقيقة</MenuItem>
                            </Select>
                        </FormControl>

                        {examData.questions.map((question, index) => (
                            <Paper key={index} sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    السؤال {index + 1}
                                </Typography>
                                <TextField
                                    label="السؤال"
                                    fullWidth
                                    value={question.question}
                                    onChange={(e) => {
                                        const newQuestions = [...examData.questions];
                                        newQuestions[index].question = e.target.value;
                                        setExamData(prev => ({ ...prev, questions: newQuestions }));
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                {question.options.map((option, optionIndex) => (
                                    <TextField
                                        key={optionIndex}
                                        label={`الاختيار ${optionIndex + 1}`}
                                        fullWidth
                                        value={option}
                                        onChange={(e) => {
                                            const newQuestions = [...examData.questions];
                                            newQuestions[index].options[optionIndex] = e.target.value;
                                            setExamData(prev => ({ ...prev, questions: newQuestions }));
                                        }}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>الاجابة الصحيحة</InputLabel>
                                    <Select
                                        value={question.correctAnswer}
                                        label="الاجابة الصحيحة"
                                        onChange={(e) => {
                                            const newQuestions = [...examData.questions];
                                            newQuestions[index].correctAnswer = e.target.value as number;
                                            setExamData(prev => ({ ...prev, questions: newQuestions }));
                                        }}
                                    >
                                        {question.options.map((_, i) => (
                                            <MenuItem key={i} value={i}>الاختيار {i + 1}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Paper>
                        ))}

                        {/* <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddQuestion}
                        >
                            اضافة اسأله
                        </Button> */}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseExamDialog}>الغاء</Button>
                    <Button onClick={handleSubmitExam} variant="contained" color="primary">
                        اضافة
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}