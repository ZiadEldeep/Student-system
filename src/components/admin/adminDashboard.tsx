import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course, Exam, Enrollment, User, Table as TableModel } from "@prisma/client";
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
    Avatar,
    Autocomplete
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

const fetchCourses = async (adminId: string): Promise<CourseWithEnrollments[]> => {
    const response = await axios.get(`/api/courses?adminId=${adminId}`);
    return response.data;
};

const fetchExams = async (courseIds: string[], adminId: string): Promise<ExamWithCourseId[]> => {
    const response = await axios.get(`/api/exams?courseIds=${courseIds.join(",")}&adminId=${adminId}`);
    return response.data;
};

const fetchTables = async (adminId: string): Promise<TableModel[]> => {
    const response = await axios.get(`/api/tables?adminId=${adminId}`);
    return response.data;
};

export default function AdminDashboard({ adminId }: { adminId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    let [tableData, setTableData] = useState({
        name: "",
        url: "",
        type: "",
        examId: ""
    });

    const {
        data: courses,
        isLoading: isCoursesLoading,
        isError: isCoursesError,
        error: coursesError
    } = useQuery({
        queryKey: ["courses", adminId],
        queryFn: () => fetchCourses(adminId)
    });
    const {
        data: tables,
        isLoading: isTablesLoading,
        isError: isTablesError,
        error: tablesError,
        refetch: refetchTables
    } = useQuery({
        queryKey: ["tables", adminId],
        queryFn: () => fetchTables(adminId)
    });


    const {
        data: exams,
        isLoading: isExamsLoading,
        isError: isExamsError,
        refetch: refetchExams,
        error: examsError
    } = useQuery({
        queryKey: ["exams", adminId, courses?.map(c => c.id)],
        enabled: !!courses?.length,
        queryFn: () => fetchExams(courses!.map(c => c.id), adminId)
    });

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
    const handleClose = () => {
        setOpen(false);
    };
    const handleCreate = async () => {
        try {
            await axios.post('/api/tables', { name: tableData.name, url: tableData.url, type: tableData.type, examId: tableData.examId });
            refetchTables();
        } catch (error) {
            console.error("حدث خطأ في إنشاء الجدول:", error);
        }
        setOpen(false);

    };
    const handleViewExam = (examId: string) => {
        router.push(`/dashboard/exams/${examId}`);
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
            <Box sx={{ mb: 4 }}>
                <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                    إنشاء جدول
                </Button>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {tables?.map(table => (
                        <Box key={table.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', padding: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                                <Chip label={table.type === "EXAM" ? "امتحان" : table.type === "GRADUATION_PROJECT" ? "مشروع تخرج" : "جدول عام"} variant="outlined" size="small" />
                                <Typography variant="body2">{table.name}</Typography>
                            </Box>
                            <Button variant="contained" color="primary" onClick={() => window.open(table.url, '_blank')}>
                                عرض
                            </Button>
                        </Box>
                    ))}
                </Stack>
            </Box>

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
                                    {/* <Stack direction="row" spacing={1}>
                                        <Tooltip title="View Statistics">
                                            <IconButton onClick={() => handleViewStatistics(course.id)} size="small">
                                                <AssessmentIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack> */}
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
                                                                    <Stack direction="row" spacing={1} component="span">
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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>إنشاء جدول</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: "500px" }}>
                        <TextField label="الاسم" fullWidth value={tableData.name} onChange={(e) => setTableData({ ...tableData, name: e.target.value })} />
                        <TextField label="الرابط" fullWidth value={tableData.url} onChange={(e) => setTableData({ ...tableData, url: e.target.value })} />
                        <FormControl fullWidth>
                            <InputLabel>النوع</InputLabel>
                            <Select label="النوع" value={tableData.type} onChange={(e) => setTableData({ ...tableData, type: e.target.value })}>
                                <MenuItem value="EXAM">جدول امتحان</MenuItem>
                                <MenuItem value="GRADUATION_PROJECT">جدول مشروع تخرج</MenuItem>
                                <MenuItem value="GENERATE_TABLE">جدول عام</MenuItem>
                            </Select>
                        </FormControl>
                        {tableData.type === "EXAM" && (<Autocomplete
                            options={exams || []}
                            fullWidth
                            getOptionLabel={(option) => option.title}
                            onChange={(e, value) => setTableData({ ...tableData, examId: value?.id || "" })}
                            renderInput={(params) => <TextField {...params} label="الامتحان" />}
                        />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>إلغاء</Button>
                    <Button onClick={handleCreate}>إنشاء</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}