"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { ToastProvider } from "@/src/context/ToastContext";
import { LanguageProvider } from "@/src/context/LanguageContext";

export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LanguageProvider>
      <ToastProvider>
        <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
          {/* Admin Sidebar with official Logo */}
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Workspace */}
          <div className="flex flex-1 flex-col min-w-0">
            <AdminHeader
              onMenuClick={() => setSidebarOpen(true)}
              title="Burayu MESOB CMS"
              subtitle="Phase I Prototype Management"
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </LanguageProvider>
  );
}
