'use client';

import React, { useState } from 'react';

type Project = {
  id: number;
  title: string;
  supervisor: string;
  department: string;
  status: 'Approved' | 'Pending' | 'Rejected';
};

const dummyProjects: Project[] = [
  {
    id: 1,
    title: 'Smart Attendance System',
    supervisor: 'Dr. Amina Khalil',
    department: 'Computer Science',
    status: 'Approved',
  },
  {
    id: 2,
    title: 'AI-based Chatbot',
    supervisor: 'Prof. Mahmoud Salem',
    department: 'Software Engineering',
    status: 'Pending',
  },
  {
    id: 3,
    title: 'IoT Smart Farming',
    supervisor: 'Eng. Lina Hossam',
    department: 'Information Systems',
    status: 'Rejected',
  },
];

const Page = () => {
  const [search, setSearch] = useState('');

  const filteredProjects = dummyProjects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Graduation Projects</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
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
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                  project.status === 'Approved'
                    ? 'bg-green-100 text-green-700'
                    : project.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
