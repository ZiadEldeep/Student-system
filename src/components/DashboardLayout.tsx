"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Divider,
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
        { text: "الرئيسية", icon: <IconHome />, path: "/dashboard" },
        { text: "المواد", icon: <IconBook />, path: "/dashboard/courses" },
        { text: "الطلاب", icon: <IconUsers />, path: "/dashboard/students" },
        { text: "الأقسام", icon: <IconSchool />, path: "/dashboard/departments" },
        { text: "التقارير", icon: <IconChartBar />, path: "/dashboard/reports" },
        { text: "المحادثات", icon: <IconMessage />, path: "/dashboard/messages" },
        { text: "مشاريع التخرج", icon: <IconCertificate />, path: "/dashboard/graduation" },
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
                    >
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => router.push(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    </motion.div>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <IconMenu2 />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={handleMenuOpen}>
                        <Avatar sx={{ bgcolor: "#184271" }}>
                            {session?.user?.name?.[0] || "U"}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => router.push("/dashboard/profile")}>
                            <ListItemIcon>
                                <IconUser />
                            </ListItemIcon>
                            الملف الشخصي
                        </MenuItem>
                        <MenuItem onClick={() => router.push("/dashboard/settings")}>
                            <ListItemIcon>
                                <IconSettings />
                            </ListItemIcon>
                            الإعدادات
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <IconLogout />
                            </ListItemIcon>
                            تسجيل الخروج
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
} 