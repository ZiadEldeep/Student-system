"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
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
    Skeleton,
} from "@mui/material";
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconSearch,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import axios from "axios";
import { UserRole } from "@prisma/client";
interface Student {
    id: string;
    name: string;
    email: string;
    department: {
        id: string;
        name: string;
    };
    status: string;
    password?: string;
}

export default function StudentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        fetchStudents(session?.user?.role === "PROFESSOR" as UserRole ? session?.user?.id : undefined);
        fetchDepartments();
    }, [status, router]);

    const fetchStudents = async (professorId?: string) => {
        try {
            const response = await axios.get('/api/students', {
                params: {
                    professorId,
                    role: "STUDENT",
                },
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleOpenDialog = (student?: Student) => {
        if (student) {
            setSelectedStudent({
                ...student,
                password: '',
            });
        } else {
            setSelectedStudent({
                id: '',
                name: '',
                email: '',
                department: { id: '', name: '' },
                status: 'نشط',
                password: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
    };

    const handleSaveStudent = async () => {
        try {
            if (selectedStudent?.id) {
                const response = await fetch(`/api/students/${selectedStudent.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: selectedStudent?.name,
                        email: selectedStudent?.email,
                        password: selectedStudent?.password,
                        departmentId: selectedStudent?.department.id,
                    }),
                });

                if (response.ok) {
                    handleCloseDialog();
                    fetchStudents();
                } else {
                    console.error('Error saving student');
                }
            }
            else {
                const response = await fetch('/api/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: selectedStudent?.name,
                        email: selectedStudent?.email,
                        password: selectedStudent?.password,
                        departmentId: selectedStudent?.department.id,
                    }),
                });

                if (response.ok) {
                    handleCloseDialog();
                    fetchStudents();
                } else {
                    console.error('Error saving student');
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        try {
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchStudents();
            } else {
                console.error('Error deleting student');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === "loading") {
        return <Skeleton variant="rectangular" height={100} />;
    }
    if (session?.user?.role === "STUDENT" as UserRole) {
        return notFound();
    }

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    إدارة الطلاب
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
                        placeholder="بحث عن طالب..."
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
                        إضافة طالب جديد
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>الاسم</TableCell>
                            <TableCell>البريد الإلكتروني</TableCell>
                            <TableCell>القسم</TableCell>
                            {/* <TableCell>الحالة</TableCell> */}
                            <TableCell>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student) => (
                            <motion.tr
                                key={student.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.department?.name}</TableCell>
                                {/* <TableCell>{student.status}</TableCell> */}
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(student)}
                                    >
                                        <IconEdit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteStudent(student.id)}
                                    >
                                        <IconTrash />
                                    </IconButton>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedStudent ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="الاسم"
                            value={selectedStudent?.name || ""}
                            onChange={(e) =>
                                setSelectedStudent({
                                    ...selectedStudent!,
                                    name: e.target.value,
                                })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="البريد الإلكتروني"
                            value={selectedStudent?.email || ""}
                            onChange={(e) =>
                                setSelectedStudent({
                                    ...selectedStudent!,
                                    email: e.target.value,
                                })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="كلمة المرور"
                            type="password"
                            value={selectedStudent?.password || ""}
                            onChange={(e) =>
                                setSelectedStudent({
                                    ...selectedStudent!,
                                    password: e.target.value,
                                })
                            }
                            sx={{ mb: 2 }}
                        />
                        <Select
                            fullWidth
                            label="القسم"
                            value={selectedStudent?.department?.id || ""}
                            onChange={(e) =>
                                setSelectedStudent({
                                    ...selectedStudent!,
                                    department: {
                                        id: e.target.value,
                                        name: departments?.find(d => d.id === e.target.value)?.name || '',
                                    },
                                })
                            }
                            sx={{ mb: 2 }}
                        >
                            {departments?.map((department) => (
                                <MenuItem key={department.id} value={department.id}>
                                    {department.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>إلغاء</Button>
                    <Button onClick={handleSaveStudent} variant="contained">
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 