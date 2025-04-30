"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  AppBar,
  Toolbar,
  Link,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from "@mui/material";
import {
  IconSchool,
  IconBook,
  IconUsers,
  IconChartBar,
  IconHome,
  IconInfoCircle,
  IconMail,
  IconUsersGroup,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    // if (status === "unauthenticated") {
    //   router.push("/login");
    // }
  }, [status, router]);

  if (status === "loading") {
    return <div>جاري التحميل...</div>;
  }

  const features = [
    {
      title: "إدارة الطلاب",
      description: "تسجيل وإدارة بيانات الطلاب وتتبع سيرهم الدراسي",
      icon: <IconUsers size={48} color="#184271" />,
      id: "students",
    },
    {
      title: "إدارة المواد",
      description: "إضافة وتعديل المواد الدراسية وتوزيعها على الأساتذة",
      icon: <IconBook size={48} color="#184271" />,
      id: "courses",
    },
    {
      title: "التقارير والإحصائيات",
      description: "متابعة أداء الطلاب وتحليل النتائج",
      icon: <IconChartBar size={48} color="#184271" />,
      id: "reports",
    },
    {
      title: "إدارة الكلية",
      description: "إدارة الأقسام والبرامج الدراسية",
      icon: <IconSchool size={48} color="#184271" />,
      id: "college",
    },
  ];

  const teamMembers = [
    {
      name: "أحمد محمد",
      role: "مطور الواجهة الأمامية",
      image: "/team/ahmed.jpg",
      social: {
        github: "https://github.com/ahmed",
        linkedin: "https://linkedin.com/in/ahmed",
        twitter: "https://twitter.com/ahmed",
      },
    },
    {
      name: "محمد علي",
      role: "مطور الواجهة الخلفية",
      image: "/team/mohamed.jpg",
      social: {
        github: "https://github.com/mohamed",
        linkedin: "https://linkedin.com/in/mohamed",
        twitter: "https://twitter.com/mohamed",
      },
    },
    {
      name: "سارة أحمد",
      role: "مصممة واجهة المستخدم",
      image: "/team/sara.jpg",
      social: {
        github: "https://github.com/sara",
        linkedin: "https://linkedin.com/in/sara",
        twitter: "https://twitter.com/sara",
      },
    },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "white", color: "black" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: "flex", gap: 4  }}>
            <Link href="#home" color="inherit" underline="none">
              <Button startIcon={<IconHome />} sx={{ gap: 1 }}>الرئيسية</Button>
            </Link>
            <Link href="#about" color="inherit" underline="none">
              <Button startIcon={<IconInfoCircle />} sx={{ gap: 1 }}>عن النظام</Button>
            </Link>
            <Link href="#features" color="inherit" underline="none">
              <Button startIcon={<IconChartBar />} sx={{ gap: 1 }}>المميزات</Button>
            </Link>
            <Link href="#team" color="inherit" underline="none">
              <Button startIcon={<IconUsersGroup />} sx={{ gap: 1 }}>فريق العمل</Button>
            </Link>
            <Link href="#contact" color="inherit" underline="none">
              <Button startIcon={<IconMail />} sx={{ gap: 1 }}>اتصل بنا</Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ pt: 8 }}>
        <motion.section
          id="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Container maxWidth="lg">
            <Box sx={{ my: 8, textAlign: "center" }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h2" component="h1" gutterBottom>
                  مرحباً بك في نظام إدارة الكلية
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  نظام متكامل لإدارة كلية الحاسبات والمعلومات
                </Typography>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ mt: 4 }}
                    onClick={() => router.push("/dashboard")}
                  >
                    ابدأ الآن
                  </Button>
                </motion.div>
              </motion.div>
            </Box>
          </Container>
        </motion.section>

        <motion.section
          id="about"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Container maxWidth="lg">
            <Box sx={{ my: 8 }}>
              <Typography variant="h3" component="h2" gutterBottom align="center">
                عن النظام
              </Typography>
              <Typography variant="body1" paragraph align="center">
                نظام إدارة الكلية هو نظام متكامل يهدف إلى تسهيل إدارة العمليات الأكاديمية والإدارية في الكلية.
                يوفر النظام مجموعة من الأدوات والمميزات التي تساعد في إدارة الطلاب والمواد الدراسية والتقارير.
              </Typography>
            </Box>
          </Container>
        </motion.section>

        <motion.section
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Container maxWidth="lg">
            <Box sx={{ my: 8 }}>
              <Typography variant="h3" component="h2" gutterBottom align="center">
                مميزات النظام
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr 1fr",
                  },
                  gap: 4,
                  mt: 4,
                }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </Container>
        </motion.section>

        <motion.section
          id="team"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Container maxWidth="lg">
            <Box sx={{ my: 8 }}>
              <Typography variant="h3" component="h2" gutterBottom align="center">
                فريق العمل
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                  },
                  gap: 4,
                  mt: 4,
                }}
              >
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card sx={{ maxWidth: 345, mx: "auto" }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={member.image}
                        alt={member.name}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.role}
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                          <IconButton
                            href={member.social.github}
                            target="_blank"
                            color="primary"
                          >
                            <IconBrandGithub />
                          </IconButton>
                          <IconButton
                            href={member.social.linkedin}
                            target="_blank"
                            color="primary"
                          >
                            <IconBrandLinkedin />
                          </IconButton>
                          <IconButton
                            href={member.social.twitter}
                            target="_blank"
                            color="primary"
                          >
                            <IconBrandTwitter />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </Container>
        </motion.section>

        <motion.section
          id="contact"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Container maxWidth="lg">
            <Box sx={{ my: 8 }}>
              <Typography variant="h3" component="h2" gutterBottom align="center">
                اتصل بنا
              </Typography>
              <Typography variant="body1" paragraph align="center">
                للاستفسارات أو المساعدة، يرجى التواصل معنا عبر البريد الإلكتروني أو الهاتف.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 4,
                }}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="contained" color="primary">
                    البريد الإلكتروني
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="contained" color="primary">
                    الهاتف
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Container>
        </motion.section>
      </Box>
    </>
  );
}
