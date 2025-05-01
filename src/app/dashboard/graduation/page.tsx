'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  notes?: string;
  grade?: number;
  leaderId: string;
  members: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  professor: {
    id: string;
    professor: {
      id: string;
      name: string;
      email: string;
    };
    status: string;
    notes?: string;
  }[];
};

const Page = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoleId, setUserRoleId] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/graduation');
        if (userRole === 'STUDENT' && response.data.some((p: Project) => p.leaderId === userRoleId)) {
          let studentProjects = response.data.filter((p: Project) => p.leaderId === userRoleId);
          let project = studentProjects[0];
          setProjects([project]);
        } else {
          setProjects(response.data);
        }

        // Calculate statistics
        if (userRole === 'STUDENT' && response.data.some((p: Project) => p.leaderId === userRoleId)) {
          let studentProjects = [response.data.filter((p: Project) => p.leaderId === userRoleId)[0]];
          setStatistics({
            total: studentProjects.length,
            approved: studentProjects.filter((p: Project) => p.status === 'APPROVED').length,
            pending: studentProjects.filter((p: Project) => p.status === 'PENDING').length,
            rejected: studentProjects.filter((p: Project) => p.status === 'REJECTED').length,
          });
        } else {
          setStatistics({
            total: response.data.length,
            approved: response.data.filter((p: Project) => p.status === 'APPROVED').length,
            pending: response.data.filter((p: Project) => p.status === 'PENDING').length,
            rejected: response.data.filter((p: Project) => p.status === 'REJECTED').length,
          });
        }
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role || null);
          setUserRoleId(data.user?.id || null);
        }
      } catch (err) {
        console.error('Failed to fetch user role:', err);
      }
    };

    if (userRoleId) {
      fetchProjects();
    }
    fetchUserRole();
  }, [userRoleId]);

  const handleAddProject = async () => {
    try {
      const response = await fetch('/api/graduation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const createdProject = await response.json();
      setProjects([...projects, createdProject]);
      setShowAddDialog(false);
      setNewProject({
        title: '',
        description: '',
      });
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/graduation/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(project => project.id !== projectId));
    } catch (err) {
      setError('Failed to delete project');
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

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                مشاريع التخرج
              </Typography>
              {userRole === 'STUDENT' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddDialog(true)}
                >
                  إضافة مشروع جديد
                </Button>
              )}
            </Box>

            <Grid container spacing={3} mb={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    إجمالي المشاريع
                  </Typography>
                  <Typography variant="h4">{statistics.total}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    المشاريع المقبولة
                  </Typography>
                  <Typography variant="h4">{statistics.approved}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    المشاريع المعلقة
                  </Typography>
                  <Typography variant="h4">{statistics.pending}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="error.main">
                    المشاريع المرفوضة
                  </Typography>
                  <Typography variant="h4">{statistics.rejected}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {projects.map((project, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" component="div">
                            {project.title}
                          </Typography>
                          <Chip
                            label={project.status === "PENDING" ? "قيد المراجعة" : project.status === "APPROVED" ? "مقبول" : "مرفوض"}
                            color={
                              project.status === 'APPROVED'
                                ? 'success'
                                : project.status === 'REJECTED'
                                  ? 'error'
                                  : 'warning'
                            }
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {project.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          عدد الأعضاء: {project.members.length}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() => router.push(`/dashboard/graduation/${project.id}`)}
                        >
                          عرض التفاصيل
                        </Button>
                        {project.leaderId === userRole && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/dashboard/graduation/${project.id}`)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      </Box>

      {/* Add Project Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مشروع جديد</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="عنوان المشروع"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="وصف المشروع"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>إلغاء</Button>
          <Button onClick={handleAddProject} variant="contained" color="primary">
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Page;
