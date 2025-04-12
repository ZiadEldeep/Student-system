"use client";

import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { IconLogin } from "@tabler/icons-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement login logic
    };

    return (
        <Container maxWidth="sm">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            width: "100%",
                            borderRadius: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                mb: 3,
                            }}
                        >
                            <IconLogin size={48} color="#184271" />
                            <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
                                تسجيل الدخول
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="البريد الإلكتروني"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="كلمة المرور"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                margin="normal"
                                required
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{ mt: 3 }}
                            >
                                تسجيل الدخول
                            </Button>
                        </form>
                    </Paper>
                </Box>
            </motion.div>
        </Container>
    );
} 