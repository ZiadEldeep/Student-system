"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
    AppBar,
    Box,
    CssBaseline,
    IconButton,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Button,
    Drawer,
    ListItemIcon,
    ListItemText,
    List,
} from "@mui/material";
import {
    IconMenu2,
    IconLogout,
    IconUser,
    IconSettings,
    IconHome,
    IconBook,
    IconUsers,
    IconSchool,
    IconChartBar,
    IconMessage,
    IconCertificate,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

const drawerWidth = 240;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { data: session } = useSession();
    const router = useRouter();
    let pathname = usePathname();
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/login" });
    };

    const menuItems = [
        { text: "الرئيسية", icon: <IconHome />, path: "/dashboard", role: ["ADMIN", "PROFESSOR", "STUDENT"] },
        { text: "المواد", icon: <IconBook />, path: "/dashboard/courses", role: ["PROFESSOR", "ADMIN"] },
        { text: "الطلاب", icon: <IconUsers />, path: "/dashboard/students", role: ["PROFESSOR", "ADMIN"] },
        { text: "المدرسين", icon: <IconUsers />, path: "/dashboard/professors", role: ["ADMIN"] },
        { text: "الأقسام", icon: <IconSchool />, path: "/dashboard/departments", role: ["ADMIN"] },
        { text: "التقارير", icon: <IconChartBar />, path: "/dashboard/reports", role: ["ADMIN"] },
        // { text: "المحادثات", icon: <IconMessage />, path: "/dashboard/messages", role: ["ADMIN", "PROFESSOR", "STUDENT"] },
        { text: "مشاريع التخرج", icon: <IconCertificate />, path: "/dashboard/graduation", role: ["ADMIN", "PROFESSOR", "STUDENT"] },
    ];

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    نظام إدارة الكلية
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <motion.div
                        key={item.text}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ display: item.role.includes(session?.user?.role || "") ? "block" : "none" }}
                    >
                        <Button
                            onClick={() => router.push(item.path)}
                            startIcon={item.icon}
                            sx={{
                                display: "flex",
                                justifyContent: "flex-start",
                                padding: 1,
                                gap: 2,
                                width: "100%",
                                textTransform: "none",
                                color: "inherit",
                            }}
                        >
                            {item.text}
                        </Button>
                    </motion.div>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: "flex", direction: "rtl" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    direction: "rtl",
                    px: 4,
                    left: { sm: `0` },
                    width: { sm: `100%` },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Toolbar sx={{ display: "flex", direction: "rtl" }}>

                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton onClick={handleMenuOpen}>
                            <Avatar sx={{ bgcolor: "white", color: "#184271" }}>
                                {session?.user?.name?.[0] || "U"}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => session?.user?.role === "PROFESSOR" ? router.push("/dashboard/professors/" + session?.user?.id) : session?.user?.role === "STUDENT" ? router.push("/dashboard/students/" + session?.user?.id) : session?.user?.role === "ADMIN" ? router.push("/dashboard/profile") : null}>
                                <ListItemIcon>
                                    <IconUser />
                                </ListItemIcon>
                                الملف الشخصي
                            </MenuItem>
                            {/* <MenuItem onClick={() => router.push("/dashboard/settings")}>
                                <ListItemIcon>
                                    <IconSettings />
                                </ListItemIcon>
                                الإعدادات
                            </MenuItem> */}
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <IconLogout />
                                </ListItemIcon>
                                تسجيل الخروج
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                    <List sx={{ direction: "rtl", gap: 1 }} className="max-sm:hidden flex" >
                        {menuItems.map((item) => {
                            let isActive = item.path === pathname || pathname.includes(item.path.split("/")[2]);
                            return (
                                <motion.div
                                    key={item.text}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ display: item.role.includes(session?.user?.role || "") ? "block" : "none" }}
                                >
                                    <Button
                                        onClick={() => router.push(item.path)}
                                        startIcon={item.icon}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            gap: 2,
                                            padding: 1,
                                            width: "100%",
                                            textTransform: "none",
                                            color: isActive ? "#184271" : "white",
                                            backgroundColor: isActive ? "white" : "#184271",
                                        }}
                                    >
                                        {isActive ? <Typography color="#184271">{item.text}</Typography> : <Typography color="white">{item.text}</Typography>}
                                    </Button>
                                </motion.div>
                            )
                        })}
                    </List>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <IconMenu2 />
                    </IconButton>
                </Box>
            </AppBar >

            <Box
                component="nav"

                sx={{ width: 0, flexShrink: { sm: 0 }, direction: "rtl" }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            right: 0,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            right: 0,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer> */}
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: "100vw",
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box >
    );
}
