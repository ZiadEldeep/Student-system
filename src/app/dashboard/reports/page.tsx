'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from 'recharts';

type ReportData = {
    users: {
        total: number;
        students: number;
        professors: number;
        admins: number;
    };
    departments: {
        total: number;
        list: Array<{
            id: string;
            name: string;
            code: string;
            studentsCount: number;
            professorsCount: number;
        }>;
    };
    courses: {
        total: number;
        list: Array<{
            id: string;
            name: string;
            code: string;
            credits: number;
            department: string;
            professor: string;
            studentsCount: number;
        }>;
    };
    exams: {
        total: number;
        list: Array<{
            id: string;
            title: string;
            course: string;
            type: string;
            startTime: string;
            endTime: string;
            studentsCount: number;
        }>;
    };
    graduationProjects: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        list: Array<{
            id: string;
            title: string;
            status: string;
            leader: string;
            membersCount: number;
            professorsCount: number;
        }>;
    };
};

const Page = () => {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [editType, setEditType] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/reports');
                if (!response.ok) {
                    throw new Error('Failed to fetch reports');
                }
                const reportData = await response.json();
                setData(reportData);
            } catch (err) {
                setError('Failed to load reports');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (type: string, item: any) => {
        setEditType(type);
        setEditData(item);
        setEditDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/reports/${editType}/${editData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                throw new Error('Failed to update data');
            }

            const updatedData = await response.json();
            setData(prevData => ({
                ...prevData!,
                [editType]: {
                    ...prevData![editType as keyof ReportData],
                    list: (prevData![editType as keyof ReportData] as any)?.list.map((item: any) =>
                        item.id === updatedData.id ? updatedData : item
                    ),
                },
            }));
            setEditDialogOpen(false);
        } catch (err) {
            setError('Failed to update data');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (error || !data) {
        return (
            <DashboardLayout>
                <Alert severity="error">{error || 'Failed to load reports'}</Alert>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ p: 3 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#184271' }}>
                        التقارير والإحصائيات
                    </Typography>

                    {/* Users Statistics */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>توزيع المستخدمين</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'الطلاب', value: data.users.students },
                                                { name: 'المدرسين', value: data.users.professors },
                                                { name: 'المشرفين', value: data.users.admins },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#184271" />
                                            <Cell fill="#2c5282" />
                                            <Cell fill="#4a5568" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ bgcolor: '#184271', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6">إجمالي المستخدمين</Typography>
                                    <Typography variant="h4">{data.users.total}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Departments Statistics */}
                    <Paper sx={{ mb: 4 }}>
                        <CardHeader
                            title="الأقسام"
                            action={
                                <Typography variant="subtitle1">
                                    إجمالي الأقسام: {data.departments.total}
                                </Typography>
                            }
                        />
                        <Box sx={{ p: 2 }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={data.departments.list}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="studentsCount" name="عدد الطلاب" fill="#184271" />
                                    <Bar dataKey="professorsCount" name="عدد المدرسين" fill="#2c5282" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>الاسم</TableCell>
                                        <TableCell>الكود</TableCell>
                                        <TableCell>عدد الطلاب</TableCell>
                                        <TableCell>عدد المدرسين</TableCell>
                                        <TableCell>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.departments.list.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell>{dept.name}</TableCell>
                                            <TableCell>{dept.code}</TableCell>
                                            <TableCell>{dept.studentsCount}</TableCell>
                                            <TableCell>{dept.professorsCount}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit('departments', dept)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Courses Statistics */}
                    <Paper sx={{ mb: 4 }}>
                        <CardHeader
                            title="المقررات"
                            action={
                                <Typography variant="subtitle1">
                                    إجمالي المقررات: {data.courses.total}
                                </Typography>
                            }
                        />
                        <Box sx={{ p: 2 }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={data.courses.list}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="studentsCount" name="عدد الطلاب" fill="#184271" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>الاسم</TableCell>
                                        <TableCell>الكود</TableCell>
                                        <TableCell>الساعات</TableCell>
                                        <TableCell>القسم</TableCell>
                                        <TableCell>المدرس</TableCell>
                                        <TableCell>عدد الطلاب</TableCell>
                                        <TableCell>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.courses.list.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell>{course.name}</TableCell>
                                            <TableCell>{course.code}</TableCell>
                                            <TableCell>{course.credits}</TableCell>
                                            <TableCell>{course.department}</TableCell>
                                            <TableCell>{course.professor}</TableCell>
                                            <TableCell>{course.studentsCount}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit('courses', course)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Exams Statistics */}
                    <Paper sx={{ mb: 4 }}>
                        <CardHeader
                            title="الامتحانات"
                            action={
                                <Typography variant="subtitle1">
                                    إجمالي الامتحانات: {data.exams.total}
                                </Typography>
                            }
                        />
                        <Box sx={{ p: 2 }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={data.exams.list}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="title" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="studentsCount" name="عدد الطلاب" fill="#184271" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>العنوان</TableCell>
                                        <TableCell>المقرر</TableCell>
                                        <TableCell>النوع</TableCell>
                                        <TableCell>وقت البداية</TableCell>
                                        <TableCell>وقت النهاية</TableCell>
                                        <TableCell>عدد الطلاب</TableCell>
                                        <TableCell>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.exams.list.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell>{exam.title}</TableCell>
                                            <TableCell>{exam.course}</TableCell>
                                            <TableCell>{exam.type}</TableCell>
                                            <TableCell>{new Date(exam.startTime).toLocaleString()}</TableCell>
                                            <TableCell>{new Date(exam.endTime).toLocaleString()}</TableCell>
                                            <TableCell>{exam.studentsCount}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit('exams', exam)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Graduation Projects Statistics */}
                    <Paper>
                        <CardHeader
                            title="مشاريع التخرج"
                            action={
                                <Box display="flex" gap={2}>
                                    <Chip label={`إجمالي المشاريع: ${data.graduationProjects.total}`} />
                                    <Chip label={`قيد الانتظار: ${data.graduationProjects.pending}`} color="warning" />
                                    <Chip label={`معتمدة: ${data.graduationProjects.approved}`} color="success" />
                                    <Chip label={`مرفوضة: ${data.graduationProjects.rejected}`} color="error" />
                                </Box>
                            }
                        />
                        <Box sx={{ p: 2 }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'قيد الانتظار', value: data.graduationProjects.pending },
                                            { name: 'معتمدة', value: data.graduationProjects.approved },
                                            { name: 'مرفوضة', value: data.graduationProjects.rejected },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#eab308" />
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>العنوان</TableCell>
                                        <TableCell>الحالة</TableCell>
                                        <TableCell>قائد الفريق</TableCell>
                                        <TableCell>عدد الأعضاء</TableCell>
                                        <TableCell>عدد المدرسين</TableCell>
                                        <TableCell>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.graduationProjects.list.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell>{project.title}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={project.status}
                                                    color={
                                                        project.status === 'APPROVED'
                                                            ? 'success'
                                                            : project.status === 'REJECTED'
                                                                ? 'error'
                                                                : 'warning'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{project.leader}</TableCell>
                                            <TableCell>{project.membersCount}</TableCell>
                                            <TableCell>{project.professorsCount}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit('graduationProjects', project)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </motion.div>
            </Box>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>تعديل البيانات</DialogTitle>
                <DialogContent>
                    {editData && (
                        <Box sx={{ mt: 2 }}>
                            {Object.entries(editData).map(([key, value]) => (
                                key !== 'id' && (
                                    <TextField
                                        key={key}
                                        fullWidth
                                        label={key}
                                        value={value}
                                        onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                                        margin="normal"
                                    />
                                )
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleSave} variant="contained" color="primary" startIcon={<SaveIcon />}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default Page; 