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
    Select,
    MenuItem,
    Card,
    CardContent,
    Avatar,
    Stack,
    Chip,
    Divider,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    Skeleton,
} from "@mui/material";
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconSearch,
    IconBook,
    IconUsers,
    IconChartBar,
    IconCalendar,
    IconMessage,
    IconSettings,
    IconUser,
    IconSchool,
    IconClock,
    IconCheck,
    IconX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

interface User {
    id: string;
    role: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    departmentId: string | null;
}

interface Professor {
    id: string;
    name: string;
    email: string;
    department: {
        id: string;
        name: string;
    };
    password?: string;
    courses?: Course[];
    students?: Student[];
    schedule?: Schedule[];
}

interface Course {
    id: string;
    name: string;
    code: string;
    credits: number;
    students: number;
    schedule: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
    attendance: number;
    grades: {
        midterm: number;
        final: number;
        assignments: number[];
    };
}

interface Schedule {
    id: string;
    day: string;
    time: string;
    course: string;
    room: string;
}

const defaultUser: Partial<User> = {
    name: 'مستخدم',
    email: 'لا يوجد بريد إلكتروني',
    role: 'مستخدم'
};

export default function ProfessorsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (status === "unauthenticated") {
            router.push("/login");
        }
        if (status === "authenticated") {
            fetchProfessors();
            fetchDepartments();
        }
    }, [status, router]);

    const fetchProfessors = async () => {
        try {
            const response = await fetch('/api/professors');
            const data = await response.json();
            setProfessors(data);
        } catch (error) {
            console.error('Error fetching professors:', error);
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

    const handleOpenDialog = (professor?: Professor) => {
        if (professor) {
            setSelectedProfessor({
                ...professor,
                password: '',
            });
        } else {
            setSelectedProfessor({
                id: '',
                name: '',
                email: '',
                department: { id: '', name: '' },
                password: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProfessor(null);
    };

    const handleSaveProfessor = async () => {
        try {
            const url = selectedProfessor?.id
                ? `/api/professors/${selectedProfessor.id}`
                : '/api/professors'
            const method = selectedProfessor?.id ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: selectedProfessor?.name,
                    email: selectedProfessor?.email,
                    password: selectedProfessor?.password,
                    departmentId: selectedProfessor?.department.id,
                }),
            })

            if (response.ok) {
                handleCloseDialog()
                fetchProfessors()
            } else {
                console.error('Error saving professor')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleDeleteProfessor = async (id: string) => {
        try {
            const response = await fetch(`/api/professors/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchProfessors();
            } else {
                console.error('Error deleting professor');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const filteredProfessors = professors.filter((professor) =>
        professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isClient || status === "loading") {
        return (
            <DashboardLayout>
                <Box sx={{ p: 3 }}>
                    <Skeleton variant="text" width={200} height={40} />
                    <Skeleton variant="text" width={300} height={24} />
                    <Box sx={{ mt: 4 }}>
                        <Skeleton variant="rectangular" height={200} />
                    </Box>
                </Box>
            </DashboardLayout>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    const user = session?.user ? {
        name: session.user.name || defaultUser.name || '',
        email: session.user.email || defaultUser.email || '',
        role: session.user.role || defaultUser.role || ''
    } : {
        name: defaultUser.name || '',
        email: defaultUser.email || '',
        role: defaultUser.role || ''
    };

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    لوحة تحكم الأستاذ
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    مرحباً بك، {user.name}
                </Typography>
            </Box>

            {/* Profile Section */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1, maxWidth: { md: '33%' } }}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 80, height: 80 }}>
                                    <IconUser size={40} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{user.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                    <Chip
                                        label={user.role}
                                        size="small"
                                        color="primary"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: 2 }}>
                    <Card>
                        <CardContent>
                            <Tabs value={activeTab} onChange={handleTabChange}>
                                <Tab icon={<IconBook />} label="المواد" />
                                <Tab icon={<IconUsers />} label="الطلاب" />
                                <Tab icon={<IconCalendar />} label="الجدول" />
                                <Tab icon={<IconChartBar />} label="التقارير" />
                            </Tabs>
                            <Box sx={{ mt: 2 }}>
                                {activeTab === 0 && (
                                    <List>
                                        {selectedProfessor?.courses?.map((course) => (
                                            <ListItem key={course.id}>
                                                <ListItemIcon>
                                                    <IconBook />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={course.name}
                                                    secondary={`${course.students} طالب - ${course.schedule}`}
                                                />
                                                <Chip
                                                    label={`${course.credits} ساعة`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {activeTab === 1 && (
                                    <List>
                                        {selectedProfessor?.students?.map((student) => (
                                            <ListItem key={student.id}>
                                                <ListItemText
                                                    primary={student.name}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2">
                                                                الحضور: {student.attendance}%
                                                            </Typography>
                                                            <br />
                                                            <Typography component="span" variant="body2">
                                                                المتوسط: {(
                                                                    (student.grades.midterm + student.grades.final) / 2
                                                                ).toFixed(2)}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => setSelectedStudent(student)}
                                                >
                                                    <IconEdit />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {activeTab === 2 && (
                                    <List>
                                        {selectedProfessor?.schedule?.map((item) => (
                                            <ListItem key={item.id}>
                                                <ListItemIcon>
                                                    <IconClock />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.course}
                                                    secondary={`${item.day} - ${item.time} (${item.room})`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {activeTab === 3 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            إحصائيات
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Paper sx={{ p: 2, flex: 1 }}>
                                                <Typography variant="h6">متوسط الحضور</Typography>
                                                <Typography variant="h4">85%</Typography>
                                            </Paper>
                                            <Paper sx={{ p: 2, flex: 1 }}>
                                                <Typography variant="h6">متوسط الدرجات</Typography>
                                                <Typography variant="h4">78%</Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<IconPlus />}
                            onClick={() => handleOpenDialog()}
                        >
                            إضافة أستاذ جديد
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<IconMessage />}
                        >
                            الرسائل
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<IconSettings />}
                        >
                            الإعدادات
                        </Button>
                    </Stack>
                </Paper>
            </Box>

            {/* Professors Table */}
            <Box sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="بحث عن أستاذ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <IconSearch style={{ marginRight: 8 }} />,
                            }}
                        />
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>الاسم</TableCell>
                                    <TableCell>البريد الإلكتروني</TableCell>
                                    <TableCell>القسم</TableCell>
                                    <TableCell>الإجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProfessors.map((professor) => (
                                    <motion.tr
                                        key={professor.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TableCell>{professor.name}</TableCell>
                                        <TableCell>{professor.email}</TableCell>
                                        <TableCell>{professor.department.name}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenDialog(professor)}
                                            >
                                                <IconEdit />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteProfessor(professor.id)}
                                            >
                                                <IconTrash />
                                            </IconButton>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedProfessor ? "تعديل بيانات الأستاذ" : "إضافة أستاذ جديد"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="الاسم"
                            value={selectedProfessor?.name || ""}
                            onChange={(e) =>
                                setSelectedProfessor({
                                    ...selectedProfessor!,
                                    name: e.target.value,
                                })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="البريد الإلكتروني"
                            value={selectedProfessor?.email || ""}
                            onChange={(e) =>
                                setSelectedProfessor({
                                    ...selectedProfessor!,
                                    email: e.target.value,
                                })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="كلمة المرور"
                            type="password"
                            value={selectedProfessor?.password || ""}
                            onChange={(e) =>
                                setSelectedProfessor({
                                    ...selectedProfessor!,
                                    password: e.target.value,
                                })
                            }
                            sx={{ mb: 2 }}
                        />
                        <Select
                            fullWidth
                            label="القسم"
                            value={selectedProfessor?.department.id || ""}
                            onChange={(e) =>
                                setSelectedProfessor({
                                    ...selectedProfessor!,
                                    department: {
                                        id: e.target.value,
                                        name: departments.find(d => d.id === e.target.value)?.name || '',
                                    },
                                })
                            }
                        >
                            {departments.map((department) => (
                                <MenuItem key={department.id} value={department.id}>
                                    {department.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>إلغاء</Button>
                    <Button onClick={handleSaveProfessor} variant="contained">
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 