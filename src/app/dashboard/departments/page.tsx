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
} from "@mui/material";
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconSearch,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

interface Department {
    id: string;
    name: string;
    code: string;
}

export default function DepartmentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        fetchDepartments();
    }, [status, router]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (department?: Department) => {
        if (department) {
            setSelectedDepartment(department);
        } else {
            setSelectedDepartment({
                id: '',
                name: '',
                code: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDepartment(null);
    };

    const handleSaveDepartment = async () => {
        try {
            const url = selectedDepartment?.id
                ? `/api/departments/${selectedDepartment.id}`
                : '/api/departments'
            const method = selectedDepartment?.id ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: selectedDepartment?.name,
                    code: selectedDepartment?.code,
                }),
            })

            if (response.ok) {
                handleCloseDialog()
                fetchDepartments()
            } else {
                console.error('Error saving department')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleDeleteDepartment = async (id: string) => {
        try {
            const response = await fetch(`/api/departments/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchDepartments();
            } else {
                console.error('Error deleting department');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredDepartments = departments.filter((department) =>
        department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === "loading") {
        return <div>جاري التحميل...</div>;
    }

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    إدارة الأقسام
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
                        placeholder="بحث عن قسم..."
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
                        إضافة قسم جديد
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>الاسم</TableCell>
                            <TableCell>الكود</TableCell>
                            <TableCell>الإجراءات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDepartments.map((department) => (
                            <motion.tr
                                key={department.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TableCell>{department.name}</TableCell>
                                <TableCell>{department.code}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(department)}
                                    >
                                        <IconEdit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteDepartment(department.id)}
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
                    {selectedDepartment ? "تعديل بيانات القسم" : "إضافة قسم جديد"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="الاسم"
                            value={selectedDepartment?.name || ""}
                            onChange={(e) =>
                                setSelectedDepartment({
                                    ...selectedDepartment!,
                                    name: e.target.value,
                                })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="الكود"
                            value={selectedDepartment?.code || ""}
                            onChange={(e) =>
                                setSelectedDepartment({
                                    ...selectedDepartment!,
                                    code: e.target.value,
                                })
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>إلغاء</Button>
                    <Button onClick={handleSaveDepartment} variant="contained">
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 