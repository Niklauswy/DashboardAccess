import Sidebar from "@/app/(routes)/(dashboard)/dashboard/components/Sidebar";
import NavbarDashboard from "@/app/(routes)/(dashboard)/dashboard/components/NavbarDashboard";

export default function DashboardLayout({children}) {
    return (
        <div className="flex w-full h-full">
            <div className="hidden h-full xl:block  w-80  xl:fixed">
                <Sidebar/>
            </div>
            <div className="w-full  h-full  xl:ml-80">
                <NavbarDashboard/>

                <div className=" h-full">{children}</div>


            </div>


        </div>

    )
}