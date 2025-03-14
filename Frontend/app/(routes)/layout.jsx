import { ClientSidebar } from "@/components/sidebar/client-sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex w-full h-full">
      {/* Sidebar container - client component will render inside */}
      <ClientSidebar />

      {/* Main content area */}
      <div className="flex flex-col w-full ml-0 bg-slate-50">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}