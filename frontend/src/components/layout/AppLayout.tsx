import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { FloatingSoundBar } from './FloatingSoundBar';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090a16] text-slate-100 flex flex-col relative selection:bg-purple-600 selection:text-white overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-700/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-700/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 relative z-10">
        {/* Sidebar only when authenticated */}
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 pb-24 md:pb-12 ${
            isAuthenticated ? 'md:ml-64 p-4 sm:p-6 lg:p-8' : ''
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Persistent Audio Controller */}
      <FloatingSoundBar />

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && <MobileNav />}
    </div>
  );
};
