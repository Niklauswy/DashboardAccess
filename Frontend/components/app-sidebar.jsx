import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import SidebarTitle from "@/app/(routes)/(dashboard)/dashboard/components/SidebarTitle";
import SidebarRoutes from "@/app/(routes)/(dashboard)/dashboard/components/SidebarRoutes";
import { useSession } from 'next-auth/react';
import { NavUser } from "./nav-user";
export function AppSidebar() {
  const { data: session } = useSession();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarTitle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarRoutes />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
