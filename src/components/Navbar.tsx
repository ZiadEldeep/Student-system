'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', role: ['ADMIN', 'PROFESSOR', 'STUDENT'] },
    { text: 'Courses', path: '/dashboard/courses', role: ['PROFESSOR', 'ADMIN'] },
    { text: 'Students', path: '/dashboard/students', role: ['PROFESSOR', 'ADMIN'] },
    { text: 'Departments', path: '/dashboard/departments', role: ['ADMIN'] },
    { text: 'Reports', path: '/dashboard/reports', role: ['ADMIN'] },
    { text: 'Messages', path: '/dashboard/messages', role: ['ADMIN', 'PROFESSOR', 'STUDENT'] },
    { text: 'Graduation Projects', path: '/dashboard/graduation', role: ['ADMIN', 'PROFESSOR', 'STUDENT'] },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-blue-600 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-blue-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="hidden md:flex space-x-4">
              {menuItems.map((item) => {
                if (item.role.includes(session?.user?.role || '')) {
                  return (
                    <Link
                      key={item.text}
                      href={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === item.path
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      {item.text}
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-700"
              >
                <span className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                  {session?.user?.name?.[0] || 'U'}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {menuItems.map((item) => {
              if (item.role.includes(session?.user?.role || '')) {
                return (
                  <Link
                    key={item.text}
                    href={item.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === item.path
                        ? 'bg-blue-700 text-white'
                        : 'text-white hover:bg-blue-700'
                    }`}
                  >
                    {item.text}
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 