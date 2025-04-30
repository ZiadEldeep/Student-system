import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course, Exam } from "@prisma/client";
import { Grid, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { IconBook } from "@tabler/icons-react";
import axios from "axios";
const fetchCourses = async (studentId: string) => {
    const response = await axios.get(`/api/courses?studentId=${studentId}`);
    return response.data;
};

const fetchExams = async (courseIds: string[], studentId: string) => {
    const response = await axios.get(`/api/exams?courseIds=${courseIds.join(",")}&studentId=${studentId}`);
    return response.data;
};
export default function StudentDashboard({ studentId }: { studentId: string }) {
    const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
        queryKey: ["courses"],
        queryFn: () => fetchCourses(studentId),
    });
    const { data: exams, isLoading: examsLoading } = useQuery<Exam[]>({
        queryKey: ["exams"],
        queryFn: () => fetchExams(courses?.map((course) => course.id) || [], studentId),
    });
    useEffect(() => {
        if (courses) {
            fetchExams(courses.map((course) => course.id), studentId);
        }
    }, [courses]);
    if (coursesLoading || examsLoading) {
        return <Skeleton variant="rectangular" height={100} />;
    }
    return (
        <Grid container spacing={3}>
            <Grid component="div" className="grid-cols-6 max-sm:grid-cols-12" >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            المواد المسجلة
                        </Typography>
                        {courses && courses.length > 0 ? (
                            <List>
                                {courses?.map((course) => (
                                    <ListItem key={course.id}>
                                        <ListItemIcon>
                                            <IconBook />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={course.name}
                                            secondary={`الدرجة: ${course.credits}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                لا يوجد مواد مسجلة
                            </Typography>
                        )}
                    </Paper>
                </motion.div>
            </Grid>
            <Grid component="div" className="grid-cols-6 max-sm:grid-cols-12" >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            الامتحانات القادمة
                        </Typography>
                        {exams && exams.length > 0 ? (
                            <List>
                                {exams?.map((exam) => (
                                    <ListItem key={exam.id}>
                                        <ListItemText
                                            primary={exam.title}
                                            secondary={`${exam.startTime.toLocaleString()} - ${exam.endTime.toLocaleString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                لا يوجد امتحانات قادمة
                            </Typography>
                        )}
                    </Paper>
                </motion.div>
            </Grid>
        </Grid>
    );
}