"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Remember sidebar collapse state in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mesob_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mesob_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#070707] antialiased">
      {/* Modern Collapsible Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-200">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={handleToggleCollapse}
          isCollapsed={isCollapsed}
          title="Burayu MESOB CMS"
          subtitle="Official Government Content Management System"
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
