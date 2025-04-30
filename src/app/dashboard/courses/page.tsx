"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
} from "@mui/material";
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconSearch,
    IconUserPlus,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Department, User, Enrollment } from "@prisma/client";
interface Course {
    id: string;
    name: string;
    code: string;
    description: string;
    credits: number;
    department: {
        id: string;
        name: string;
    };
    professor: {
        id: string;
        name: string;
    };
    enrollments: Enrollment[];
    departmentId: string;
    professorId: string;
}
let fetchDepartments = async () => {
    const response = await axios.get("/api/departments");
    return response.data;
}
let fetchProfessors = async () => {
    const response = await axios.get("/api/professors");
    return response.data;
}
let fetchStudents = async () => {
    const response = await axios.get("/api/students", {
        params: {
            role: "STUDENT",
        },
    });
    return response.data;
}

export default function CoursesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openAddStudentsDialog, setOpenAddStudentsDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        credits: 0,
        departmentId: "",
        professorId: "",
    });
    let { data: departments } = useQuery<Department[]>({
        queryKey: ["departments"],
        queryFn: fetchDepartments,
    });
    let { data: professors } = useQuery<User[]>({
        queryKey: ["professors"],
        queryFn: fetchProfessors,
    });
    let { data: students } = useQuery<User[]>({
        queryKey: ["students"],
        queryFn: fetchStudents,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        fetchCourses();
    }, [status, router]);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (course?: Course) => {
        if (course) {
            setSelectedCourse(course);
            setFormData({
                name: course.name,
                code: course.code,
                description: course.description || "",
                credits: course.credits,
                departmentId: course.departmentId || "",
                professorId: course.professorId || "",
            });
        } else {
            setSelectedCourse(null);
            setFormData({
                name: "",
                code: "",
                description: "",
                credits: 0,
                departmentId: "",
                professorId: "",
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCourse(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log(formData)
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    code: formData.code,
                    description: formData.description,
                    credits: formData.credits,
                    departmentId: formData.departmentId,
                    professorId: formData.professorId,
                }),
            });

            if (response.ok) {
                handleCloseDialog();
                fetchCourses();
            } else {
                console.error('Error adding course');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteCourse = (id: string) => {
        // TODO: Delete course from API
    };

    const handleAddStudentsToCourse = async (id: string) => {
        try {
            // TODO: Add students to course from API
            let response = await axios.post('/api/enrollments', {
                courseId: id,
                studentIds: selectedStudents.map((student) => student.id),
            });
            if (response.status === 200) {
                fetchCourses();
            }
            setOpenAddStudentsDialog(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (status === "loading") {
        return <div>جاري التحميل...</div>;
    }

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    إدارة المواد
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                    mb: 3,
                }}
            >
                <Box>
                    <TextField
                        fullWidth
                        placeholder="بحث عن مادة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <IconSearch style={{ marginRight: 8 }} />,
                        }}
                    />
                </Box>
                <Box sx={{ textAlign: "left" }}>
                    <Button
                        variant="contained"
                        startIcon={<IconPlus />}
                        onClick={() => handleOpenDialog()}
                    >
                        إضافة مادة جديدة
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>اسم المادة</TableCell>
                            <TableCell>الكود</TableCell>
                            <TableCell>القسم</TableCell>
                            <TableCell>الأستاذ</TableCell>
                            <TableCell>الطلاب المسجلين</TableCell>
                            <TableCell>الساعات المعتمدة</TableCell>
                            <TableCell>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCourses.map((course) => (
                            <motion.tr
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TableCell>{course.name}</TableCell>
                                <TableCell>{course.code}</TableCell>
                                <TableCell>{course.department.name}</TableCell>
                                <TableCell>{course.professor.name}</TableCell>
                                <TableCell>{course.credits}</TableCell>
                                <TableCell>{course.enrollments.length}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(course)}
                                    >
                                        <IconEdit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteCourse(course.id)}
                                    >
                                        <IconTrash />
                                    </IconButton>
                                    {/* add students to course */}
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setOpenAddStudentsDialog(true);
                                        }}
                                    >
                                        <IconUserPlus />
                                    </IconButton>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedCourse ? "تعديل بيانات المادة" : "إضافة مادة جديدة"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="اسم المادة"
                            value={selectedCourse?.name || ""}
                            onChange={(e) => {
                                setSelectedCourse({
                                    ...selectedCourse!,
                                    name: e.target.value,
                                })
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="كود المادة"
                            value={selectedCourse?.code || ""}
                            onChange={(e) => {
                                setSelectedCourse({
                                    ...selectedCourse!,
                                    code: e.target.value,
                                })
                                setFormData({
                                    ...formData,
                                    code: e.target.value,
                                })
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="الوصف"
                            value={selectedCourse?.description || ""}
                            onChange={(e) => {
                                setSelectedCourse({
                                    ...selectedCourse!,
                                    description: e.target.value,
                                })
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>القسم</InputLabel>
                            <Select
                                value={selectedCourse?.departmentId || ""}
                                onChange={(e) => {
                                    setSelectedCourse({
                                        ...selectedCourse!,
                                        departmentId: e.target.value,
                                    })
                                    setFormData({
                                        ...formData,
                                        departmentId: e.target.value,
                                    })
                                }}
                                label="القسم"
                            >
                                {departments?.map((department) => (
                                    <MenuItem key={department.id} value={department.id}>
                                        {department.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>الأستاذ</InputLabel>
                            <Select
                                value={selectedCourse?.professorId || ""}
                                onChange={(e) => {
                                    setSelectedCourse({
                                        ...selectedCourse!,
                                        professorId: e.target.value,
                                    })
                                    setFormData({
                                        ...formData,
                                        professorId: e.target.value,
                                    })
                                }}
                                label="الأستاذ"
                            >
                                {professors?.map((professor) => (
                                    <MenuItem key={professor.id} value={professor.id}>
                                        {professor.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="الساعات المعتمدة"
                            type="number"
                            value={selectedCourse?.credits || 0}
                            onChange={(e) => {
                                setSelectedCourse({
                                    ...selectedCourse!,
                                    credits: parseInt(e.target.value),
                                })
                                setFormData({
                                    ...formData,
                                    credits: parseInt(e.target.value),
                                })
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>إلغاء</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
            {students && <Dialog open={openAddStudentsDialog} onClose={() => setOpenAddStudentsDialog(false)}>
                <DialogTitle>إضافة طلاب إلى المادة</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Autocomplete
                            multiple
                            options={students}
                            defaultValue={students.filter((student: any) => selectedCourse?.enrollments.map((enrollment: any) => enrollment?.studentId).includes(student.id))}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => <TextField {...params} label="طلاب" />}
                            onChange={(event, value) => setSelectedStudents(value)}
                        />
                        <Button onClick={() => handleAddStudentsToCourse(selectedCourse?.id || "")}>إضافة</Button>
                        <Button onClick={() => setOpenAddStudentsDialog(false)}>إلغاء</Button>
                    </Box>
                </DialogContent>
            </Dialog>}
        </DashboardLayout>
    );
} 