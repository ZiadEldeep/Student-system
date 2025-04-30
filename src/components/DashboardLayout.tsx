"use client";

import React from 'react';
import Navbar from './Navbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
