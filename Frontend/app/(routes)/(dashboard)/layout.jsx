'use client'
import { useState } from "react";
import NavbarDashboard from "@/app/(routes)/(dashboard)/dashboard/components/NavbarDashboard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <div className="flex w-full h-full">
      {/* Sidebar para xl screens */}
      <div className={`hidden xl:block fixed ${isSidebarCollapsed ? "w-16" : "w-80"} h-full`}>
        <SidebarProvider>
          <AppSidebar collapsed={isSidebarCollapsed} />
          <SidebarTrigger onClick={toggleSidebar} />
        </SidebarProvider>
      </div>

      {/* Main content area */}
      <div className={`flex flex-col w-full ml-0 xl:ml-${isSidebarCollapsed ? "16" : "80"}`}>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}