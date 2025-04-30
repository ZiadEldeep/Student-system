import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course, Exam, Enrollment } from "@prisma/client";
import { Grid, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { IconBook } from "@tabler/icons-react";
import axios from "axios";
type CourseWithEnrollments = Course & { enrollments: Enrollment[] };
const fetchCourses = async (professorId: string) => {
    const response = await axios.get<CourseWithEnrollments[]>(`/api/courses?professorId=${professorId}`);
    return response.data;
};

const fetchExams = async (courseIds: string[], professorId: string) => {
    const response = await axios.get(`/api/exams?courseIds=${courseIds.join(",")}&professorId=${professorId}`);
    return response.data;
};
export default function ProfessorDashboard({ professorId }: { professorId: string }) {
    const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithEnrollments[]>({
        queryKey: ["courses"],
        queryFn: () => fetchCourses(professorId),
    });
    const { data: exams, isLoading: examsLoading } = useQuery<Exam[]>({
        queryKey: ["exams"],
        queryFn: () => fetchExams(courses?.map((course) => course.id) || [], professorId),
    });
    useEffect(() => {
        if (courses) {
            fetchExams(courses.map((course) => course.id), professorId);
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
                            المواد التي تدرسها
                        </Typography>
                        {courses?.length === 0 && (
                            <Typography variant="body1" gutterBottom>
                                لا يوجد مواد تدرسها
                            </Typography>
                        )}
                        <List>
                            {courses?.map((course: CourseWithEnrollments) => (
                                <ListItem key={course.id}>
                                    <ListItemIcon>
                                        <IconBook />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={course.name}
                                        secondary={`${course?.enrollments?.length || 0} طالب`}
                                    />
                                </ListItem>
                            ))}
                        </List>
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
                        {exams?.length === 0 && (
                            <Typography variant="body1" gutterBottom>
                                لا يوجد امتحانات قادمة
                            </Typography>
                        )}
                        <List>

                            {exams?.map((exam) => (
                                <ListItem key={exam.id}>
                                    <ListItemText
                                        primary={exam.title}
                                        secondary={`${exam.startTime} - ${exam.endTime}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </motion.div>
            </Grid>
        </Grid>
    );
}