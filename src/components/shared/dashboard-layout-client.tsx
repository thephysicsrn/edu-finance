"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-24 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

