import React from 'react';
import SidebarRoutes from "@/app/(routes)/(dashboard)/dashboard/components/SidebarRoutes";
import SidebarTitle from "@/app/(routes)/(dashboard)/dashboard/components/SidebarTitle";

const Sidebar = () => {
    return (
        <div className="h-full  text-white w-80">
            <div className="flex flex-col h-full border-r">

                <SidebarTitle/>
                <SidebarRoutes/>
            </div>
        </div>

    );
};

export default Sidebar;