'use client'

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { CustomTrigger } from "@/components/sidebar/CustomTrigger";

export function ClientSidebar() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <>
      {/* Sidebar for xl screens */}
      <div>
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
    </>
  );
}
