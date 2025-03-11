'use client'

import {dataSlidebarRoutes} from "@/components/sidebar/SidebarRoutes.data";
import SidebarItem from "@/components/sidebar/SidebarItem";
import {Badge} from "@/components/ui/badge";

const SidebarRoutes = () => {
    const renderItemsForSection = (section) => {
        return dataSlidebarRoutes
            .filter(item => item.section === section)
            .map((item) => (
                <SidebarItem key={item.label} item={item}>{item.label}</SidebarItem>
            ));
    };

    return (
        <div className="flex flex-col justify-between h-full">

            <div className="p-2 md:p-6  text-black">

                <p className="mb-2 text-slate-500 text-xs font-semibold uppercase">GENERAL</p>
                {renderItemsForSection("general")}


                <p className="mt-10 mb-2 text-slate-500 text-xs font-semibold uppercase">GESTIONAR</p>
                {renderItemsForSection("gestionar")}

                  <p className="mt-10 mb-2 text-slate-500 text-xs font-semibold uppercase">SOPORTE</p>
                {renderItemsForSection("soporte")}


            </div>
  
        </div>
    );
};

export default SidebarRoutes;