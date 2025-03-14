    'use client'
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { CustomTrigger } from "@/components/sidebar/CustomTrigger";

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);
  


  return (
    <div className="flex w-full h-full ">
      {/* Sidebar para xl screens */}
      <div >
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </div>

      {/* Mobile Sidebar */}
      <div className="block xl:hidden fixed top-0 left-0 h-full" 
           style={{ "--sidebar-width": "20rem", "--sidebar-width-mobile": "20rem" }}>
        <SidebarProvider>
          <AppSidebar />
          <CustomTrigger onClick={toggleSidebar} />
        </SidebarProvider>
      </div>

      {/* Main content area */}
      <div className={`flex flex-col w-full ml-0  bg-slate-50`}>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}