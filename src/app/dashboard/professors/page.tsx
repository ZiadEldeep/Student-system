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
    Skeleton,
} from "@mui/material";
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconSearch,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

interface Professor {
    id: string;
    name: string;
    email: string;
    department: {
        id: string;
        name: string;
    };
    password?: string;
}

export default function ProfessorsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        fetchProfessors();
        fetchDepartments();
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

    const filteredProfessors = professors.filter((professor) =>
        professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === "loading") {
        return <Skeleton variant="rectangular" height={100} />;
    }

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    إدارة الأساتذة
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
                        placeholder="بحث عن أستاذ..."
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
                        إضافة أستاذ جديد
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
                                <TableCell>{professor.department?.name}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(professor)}
                                    >
                                        <IconEdit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            setSelectedProfessor(professor)
                                            setOpenDeleteDialog(true)
                                        }}
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
                            value={selectedProfessor?.department?.id || ""}
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
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>
                    حذف الأستاذ
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        هل أنت متأكد من رغبتك في حذف الأستاذ {selectedProfessor?.name}؟
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>إلغاء</Button>
                    <Button onClick={() => handleDeleteProfessor(selectedProfessor?.id || '')} variant="contained">
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 