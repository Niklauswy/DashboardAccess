import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import SidebarTitle from "@/app/(routes)/(dashboard)/dashboard/components/SidebarTitle";
import SidebarRoutes from "@/app/(routes)/(dashboard)/dashboard/components/SidebarRoutes";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarTitle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarRoutes />
      </SidebarContent>
      <SidebarFooter>
    
      </SidebarFooter>
    </Sidebar>
  );
}
