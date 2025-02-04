'use client'
import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import SidebarRoutes from "@/app/(routes)/(dashboard)/dashboard/components/SidebarRoutes";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from 'next-auth/react';

const NavbarDashboard = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between w-full h-20 px-4 border-b bg-background">
      <div className="flex items-center">
        <div className="block xl:hidden mr-4">
          <Sheet>
            <SheetTrigger className="flex items-center">
              <Menu className="w-6 h-6 text-slate-700" />
            </SheetTrigger>
            <SheetContent side="left">
              <SidebarRoutes />
            </SheetContent>
          </Sheet>
        </div>
        <div className="text-xl font-bold text-slate-800">
          Dashboard
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-6 h-6 text-slate-700" />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-600 rounded-full"></span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
              <User className="w-6 h-6 text-slate-700" />
              <span className="hidden md:block text-slate-700">
                {session?.user?.name || "Usuario"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              Ajustes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
              Cerrar sesión
              <LogOut className="w-4 h-4 ml-2" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default NavbarDashboard;