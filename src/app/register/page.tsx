"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from "@mui/material";
import { IconUserPlus, IconSchool, IconUser } from "@tabler/icons-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRoleChange = (e: any) => {
        setFormData((prev) => ({
            ...prev,
            role: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("كلمة المرور غير متطابقة");
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "حدث خطأ أثناء التسجيل");
            }

            setSuccess("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Container maxWidth="sm">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ my: 8 }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <IconUserPlus size={48} color="#184271" />
                        </motion.div>
                        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                            إنشاء حساب جديد
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
                                {success}
                            </Alert>
                        )}

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ mt: 3, width: "100%" }}
                        >
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="الاسم"
                                    name="name"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <IconUser style={{ marginRight: 8 }} />,
                                    }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="البريد الإلكتروني"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: <IconSchool style={{ marginRight: 8 }} />,
                                    }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="كلمة المرور"
                                    type="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="تأكيد كلمة المرور"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>نوع الحساب</InputLabel>
                                    <Select
                                        value={formData.role}
                                        label="نوع الحساب"
                                        onChange={handleRoleChange}
                                    >
                                        <MenuItem value="STUDENT">طالب</MenuItem>
                                        <MenuItem value="PROFESSOR">أستاذ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    إنشاء الحساب
                                </Button>
                            </motion.div>

                            <Box sx={{ textAlign: "center" }}>
                                <Button
                                    onClick={() => router.push("/login")}
                                    sx={{ textTransform: "none" }}
                                >
                                    لديك حساب بالفعل؟ سجل دخولك
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </motion.div>
        </Container>
    );
} 