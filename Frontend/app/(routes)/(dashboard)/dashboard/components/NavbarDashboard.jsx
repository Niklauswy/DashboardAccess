import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import SidebarRoutes from "@/app/(routes)/(dashboard)/dashboard/components/SidebarRoutes";
import {Menu} from "lucide-react";


const NavbarDashboard = () => {
    return (
        <nav className="flex items-center justify-center w-full  h-20 px-2 border-b gapx-4 md:px-6 bg-background">
            <div className="block xl:hidden">
                <Sheet>
                    <SheetTrigger className="flex items-center">
                        <Menu/>
                    </SheetTrigger>
                    <SheetContent side="left">

                    <SidebarRoutes/>
                    </SheetContent>
                </Sheet>
            </div>

        </nav>
    );
};

export default NavbarDashboard;