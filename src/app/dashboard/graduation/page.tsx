'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/DashboardLayout';

type Project = {
  id: number;
  title: string;
  supervisor: string;
  department: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  description: string;
};

const dummyProjects: Project[] = [
  {
    id: 1,
    title: 'Smart Attendance System',
    supervisor: 'Dr. Amina Khalil',
    department: 'Computer Science',
    status: 'Approved',
    description: 'An automated attendance system using facial recognition technology to track student attendance in real-time.',
  },
  {
    id: 2,
    title: 'AI-based Chatbot',
    supervisor: 'Prof. Mahmoud Salem',
    department: 'Software Engineering',
    status: 'Pending',
    description: 'An intelligent chatbot system that can answer student queries and provide academic support 24/7.',
  },
  {
    id: 3,
    title: 'IoT Smart Farming',
    supervisor: 'Eng. Lina Hossam',
    department: 'Information Systems',
    status: 'Rejected',
    description: 'A smart farming solution using IoT sensors to monitor and optimize agricultural conditions.',
  },
];

const Page = () => {
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>(dummyProjects);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    supervisor: '',
    department: '',
    status: 'Pending',
    description: '',
  });

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (projectId: number, newStatus: 'Approved' | 'Pending' | 'Rejected') => {
    setProjects(projects.map(project =>
      project.id === projectId ? { ...project, status: newStatus } : project
    ));
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      supervisor: project.supervisor,
      department: project.department,
      status: project.status,
      description: project.description,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      setProjects(projects.map(project =>
        project.id === editingProject.id
          ? { ...project, ...formData }
          : project
      ));
    } else {
      const newProject: Project = {
        id: projects.length + 1,
        ...formData,
      };
      setProjects([...projects, newProject]);
    }
    setShowModal(false);
    setEditingProject(null);
    setFormData({
      title: '',
      supervisor: '',
      department: '',
      status: 'Pending',
      description: '',
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-100">
        <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 'none' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Graduation Projects
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit">
                <AssessmentIcon />
              </IconButton>
              <IconButton color="inherit">
                <PeopleIcon />
              </IconButton>
              <IconButton color="inherit">
                <EventIcon />
              </IconButton>
              <IconButton color="inherit">
                <UploadIcon />
              </IconButton>
              <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Graduation Projects</h1>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                + Add Project
              </button>
            </div>

            <input
              type="text"
              placeholder="Search projects..."
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
                >
                  <h2 className="text-lg font-semibold text-gray-900">{project.title}</h2>
                  <p className="text-sm text-gray-700">Supervisor: {project.supervisor}</p>
                  <p className="text-sm text-gray-600">Department: {project.department}</p>
                  <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                  <div className="mt-2 space-y-2">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full ${project.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {project.status}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(project.id, 'Approved')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(project.id, 'Pending')}
                        className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(project.id, 'Rejected')}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Edit Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                  <input
                    type="text"
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Approved' | 'Pending' | 'Rejected' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProject(null);
                      setFormData({
                        title: '',
                        supervisor: '',
                        department: '',
                        status: 'Pending',
                        description: '',
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingProject ? 'Update' : 'Add'} Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Page;
