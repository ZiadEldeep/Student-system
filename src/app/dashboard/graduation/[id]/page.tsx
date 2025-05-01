'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Chip,
    Alert,
    CircularProgress,
    Autocomplete,
    Tooltip,
    TextareaAutosize,
    InputLabel,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IconEdit, IconX } from '@tabler/icons-react';

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
let fetchStudents = async (isNotJoinedGraduation: boolean) => {
    const response = await axios.get('/api/students', { params: { isNotJoinedGraduation, role: 'STUDENT' } });
    return response.data;
}
let fetchProfessors = async () => {
    const response = await axios.get('/api/professors');
    return response.data;
}
const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    const router = useRouter();
    const { id } = use(params);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
    const [statusProject, setStatusProject] = useState('');
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        status: '',
        notes: '',
        grade: '',
    });
    const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
    const [alerts, setAlerts] = useState<React.ReactNode[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [addProfessorDialogOpen, setAddProfessorDialogOpen] = useState(false);
    const [newProfessorIds, setNewProfessorIds] = useState<string[]>([]);
    const [addProfessorNotesDialogOpen, setAddProfessorNotesDialogOpen] = useState(false);
    const [addProfessorNotes, setAddProfessorNotes] = useState('');
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
    let { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['students'],
        queryFn: () => fetchStudents(true),
    });
    let { data: professors, isLoading: professorsLoading } = useQuery({
        queryKey: ['professors'],
        queryFn: () => fetchProfessors(),
    });
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/graduation/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }
                const data = await response.json();
                setProject(data);
                setEditData({
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    notes: data.notes || '',
                    grade: data.grade?.toString() || '',
                });
            } catch (err) {
                setError('Failed to load project details');
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
                    setUserId(data.user?.id || null)
                }
            } catch (err) {
                console.error('Failed to fetch user role:', err);
            }
        };

        fetchProject();
        fetchUserRole();
    }, [id]);
    const handleEditProject = async () => {
        try {
            const response = await fetch(`/api/graduation/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: statusProject,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to edit project');
            }
            const updatedProject = await response.json();
            setProject(updatedProject);
            setEditProjectDialogOpen(false);
        } catch (err) {
            setError('Failed to edit project');
        }
    }

    const handleEdit = async () => {
        try {
            const response = await fetch(`/api/graduation/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editData.title,
                    description: editData.description,
                    status: editData.status,
                    notes: editData.notes,
                    grade: editData.grade ? parseFloat(editData.grade) : undefined,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const updatedProject = await response.json();
            setProject(updatedProject);
            setEditDialogOpen(false);
        } catch (err) {
            setError('Failed to update project');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            const response = await fetch(`/api/graduation/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            router.push('/dashboard/graduation');
        } catch (err) {
            setError('Failed to delete project');
        }
    };

    const handleAddMember = async () => {
        newMemberIds.forEach(async (newMemberId) => {
            try {
                // First, find the user by email
                const userResponse = await axios.post(`/api/graduation/${id}/members`, {
                    userId: newMemberId,
                });
                if (userResponse.status !== 200) {
                    throw new Error('User not found');
                }
                const user = userResponse.data;

                // Then add the user to the project
                const response = await fetch(`/api/graduation/${id}/members`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to add member');
                }

                const updatedProject = await fetch(`/api/graduation/${id}`).then(res => res.json());
                setProject(updatedProject);
                setAddMemberDialogOpen(false);
                setNewMemberIds([]);
            } catch (err) {
                setError('Failed to add member');
            }
        });
    };
    const handleAddProfessor = async () => {
        try {
            const response = await fetch(`/api/graduation/${id}/professors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    professorId: newProfessorIds
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add professor');
            }

            const updatedProject = await response.json();
            setProject(updatedProject);
            setAddProfessorDialogOpen(false);
            setNewProfessorIds([]);
        } catch (err) {
            setError('Failed to add professor');
        }
    }
    const handleApproveProfessor = async () => {
        try {
            const response = await fetch(`/api/graduation/${id}/professors`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'APPROVED',
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to approve professor');
            }
            const updatedProject = await response.json();
            setProject(updatedProject);
        } catch (err) {
            setError('Failed to approve professor');
        }
    }
    const handleRejectProfessor = async () => {
        try {
            const response = await fetch(`/api/graduation/${id}/professors/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'REJECTED',
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to reject professor');
            }
            const updatedProject = await response.json();
            setProject(updatedProject);
        } catch (err) {
            setError('Failed to reject professor');
        }
    }
    const handleResetProfessor = async () => {
        try {
            const response = await fetch(`/api/graduation/${id}/professors/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'PENDING',
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to reset professor');
            }
            const updatedProject = await response.json();
            setProject(updatedProject);
        } catch (err) {
            setError('Failed to reset professor');
        }
    }
    const handleAddProfessorNotes = async () => {
        try {
            const response = await fetch(`/api/graduation/${id}/professors/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notes: addProfessorNotes,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to add professor notes');
            }
            const updatedProject = await response.json();
            setProject(updatedProject);
        } catch (err) {
            setError('Failed to add professor notes');
        }
    }
    const handleRemoveMember = async (memberId: string) => {
        try {
            const response = await fetch(`/api/graduation/${id}/members?userId=${memberId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove member');
            }

            const updatedProject = await fetch(`/api/graduation/${id}`).then(res => res.json());
            setProject(updatedProject);
        } catch (err) {
            setError('Failed to remove member');
        }
    };

    if (loading || studentsLoading) {
        return (
            <DashboardLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                    <CircularProgress />
                </Box>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout>
                <Alert severity="error">{error || 'Project not found'}</Alert>
            </DashboardLayout>
        );
    }
    if (error) {
        setAlerts([
            <Alert severity="error">{error || 'Project not found'}</Alert>
        ]);
    }

    const isLeader = project.leaderId === userId;
    const isProfessor = userRole === 'PROFESSOR';

    return (
        <DashboardLayout>
            {alerts.map((alert, index) => (
                alert
            ))}
            <Box sx={{ p: 3 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h4" component="h1">
                                {project.title}
                            </Typography>
                            <Box>
                                {isLeader && (
                                    <>
                                        <Tooltip title="تعديل المشروع">
                                            <IconButton onClick={() => setEditDialogOpen(true)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="حذف المشروع">
                                            <IconButton onClick={handleDelete} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="إضافة مدرس">
                                            <IconButton onClick={() => setAddProfessorDialogOpen(true)} color="primary">
                                                <PersonAddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography variant="body1" paragraph>
                                    {project.description}
                                </Typography>

                                <Box mb={3}>
                                    <Typography variant="h6" gutterBottom>
                                        حالة المشروع
                                    </Typography>
                                    <Chip
                                        label={project.status === 'PENDING' ? 'قيد الإنتظار' : project.status === 'APPROVED' ? 'معتمد' : 'مرفوض'}
                                        color={
                                            project.status === 'APPROVED'
                                                ? 'success'
                                                : project.status === 'REJECTED'
                                                    ? 'error'
                                                    : 'warning'
                                        }
                                    />
                                    <Button variant="text" color="primary" onClick={() => setEditProjectDialogOpen(true)}>
                                        <IconEdit />
                                    </Button>
                                </Box>
                                {project.professor.length > 0 && userRole !== 'PROFESSOR'
                                    ? (
                                        <Box mb={3} display="flex" justifyContent="flex-start" alignItems="center" gap={2}>
                                            <Typography variant="h6" gutterBottom>
                                                المدرس
                                            </Typography>
                                            <Typography variant="body1">{project.professor[0].professor.name}</Typography>
                                            <Chip
                                                label={project.professor[0].status === 'PENDING' ? 'قيد الإنتظار' : project.professor[0].status === 'APPROVED' ? 'معتمد' : 'مرفوض'}
                                                color={
                                                    project.professor[0].status === 'APPROVED'
                                                        ? 'success'
                                                        : project.professor[0].status === 'REJECTED'
                                                            ? 'error'
                                                            : 'warning'
                                                }
                                            />
                                        </Box>
                                    )
                                    : userRole === 'PROFESSOR' && (
                                        <Box mb={3} alignItems="center" gap={2}>
                                            <Typography variant="h6" gutterBottom>
                                                هل توافق على أعتماد هذا المشروع
                                            </Typography>
                                            <Box display="flex" justifyContent="flex-start" alignItems="center" gap={2}>
                                                {project.professor[0].status === 'PENDING' ? (
                                                    <>
                                                        <Button variant="contained" color="primary" onClick={() => handleApproveProfessor()}>
                                                            موافق
                                                        </Button>
                                                        <Button variant="contained" color="error" onClick={() => handleRejectProfessor()}>
                                                            مرفوض
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Typography variant="body1">
                                                        {project.professor[0].status === 'APPROVED' ? (
                                                            <>
                                                                <Chip label="معتمد" color="primary" />
                                                                <IconButton onClick={() => handleResetProfessor()}>
                                                                    <IconX />
                                                                </IconButton>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Chip label="مرفوض" color="error" />
                                                                <IconButton onClick={() => handleResetProfessor()}>
                                                                    <IconX />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box display="flex" justifyContent="flex-start" alignItems="center" gap={2} mt={2}>
                                                <Button variant="contained" color="primary" onClick={() => setAddProfessorNotesDialogOpen(true)}>
                                                    {project.notes ? 'تعديل الملاحظات' : 'إضافة ملاحظات'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    )
                                }

                                {project.notes && (
                                    <Box mb={3}>
                                        <Typography variant="h6" gutterBottom>
                                            ملاحظات المدرس
                                        </Typography>
                                        <Typography variant="body1">{project.notes}</Typography>
                                    </Box>
                                )}

                                {project.grade && (
                                    <Box mb={3}>
                                        <Typography variant="h6" gutterBottom>
                                            الدرجة
                                        </Typography>
                                        <Typography variant="body1">{project.grade}</Typography>
                                    </Box>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper sx={{ p: 2 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6">الأعضاء</Typography>
                                        {isLeader && (
                                            <IconButton onClick={() => setAddMemberDialogOpen(true)} color="primary">
                                                <PersonAddIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <List>
                                        {project.members?.map((member) => (
                                            <ListItem
                                                key={member.id}
                                                secondaryAction={
                                                    isLeader && member.role !== 'LEADER' && (
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => handleRemoveMember(member.user.id)}
                                                        >
                                                            <PersonRemoveIcon />
                                                        </IconButton>
                                                    )
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar>{member.user.name[0]}</Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={member.user.name}
                                                    secondary={
                                                        <>
                                                            {member.user.email}
                                                            <Chip
                                                                component={"span"}
                                                                label={member.role}
                                                                size="small"
                                                                sx={{ ml: 1 }}
                                                            />
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                </motion.div>
            </Box>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>تعديل المشروع</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="العنوان"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="الوصف"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    {isProfessor && (
                        <>
                            <TextField
                                fullWidth
                                label="الحالة"
                                value={editData.status}
                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                margin="normal"
                                select
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="PENDING">قيد الإنتظار</option>
                                <option value="APPROVED">معتمد</option>
                                <option value="REJECTED">مرفوض</option>
                            </TextField>
                            <TextField
                                fullWidth
                                label="ملاحظات المدرس"
                                value={editData.notes}
                                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                margin="normal"
                                multiline
                                rows={4}
                            />
                            <TextField
                                fullWidth
                                label="الدرجة"
                                value={editData.grade}
                                onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                                margin="normal"
                                type="number"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleEdit} variant="contained" color="primary">
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={addMemberDialogOpen} onClose={() => setAddMemberDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>إضافة عضو جديد</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        fullWidth
                        multiple
                        options={students}
                        sx={{ width: '100%', mb: 2, mt: 2 }}
                        getOptionLabel={(option: any) => option.name}
                        renderInput={(params) => <TextField {...params} label="إضافة عضو جديد" />}
                        onChange={(event, value) => setNewMemberIds(value.map((option: any) => option.id))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddMemberDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleAddMember} variant="contained" color="primary">
                        إضافة
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={addProfessorDialogOpen} onClose={() => setAddProfessorDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>إضافة مدرس</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        fullWidth
                        options={professors || []}
                        getOptionLabel={(option: any) => option.name}
                        renderInput={(params) => <TextField {...params} label="إضافة مدرس" />}
                        onChange={(event, value) => setNewProfessorIds(value?.id || '')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddProfessorDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleAddProfessor} variant="contained" color="primary">
                        إضافة
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={addProfessorNotesDialogOpen} onClose={() => setAddProfessorNotesDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle> {project.notes ? 'تعديل الملاحظات' : 'إضافة ملاحظات'}</DialogTitle>
                <DialogContent>
                    <InputLabel>الملاحظات</InputLabel>
                    <TextareaAutosize value={addProfessorNotes || project.notes} onChange={(e) => setAddProfessorNotes(e.target.value)} minRows={4} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #ccc' }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddProfessorNotesDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleAddProfessorNotes} variant="contained" color="primary">
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editProjectDialogOpen} onClose={() => setEditProjectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>تعديل حالة المشروع</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="الحالة"
                        value={statusProject}
                        onChange={(e) => setStatusProject(e.target.value)}
                        margin="normal"
                        select
                        SelectProps={{
                            native: true,
                        }}
                    >
                        <option value="PENDING">قيد الإنتظار</option>
                        <option value="APPROVED">معتمد</option>
                        <option value="REJECTED">مرفوض</option>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditProjectDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleEditProject} variant="contained" color="primary">
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default Page; 