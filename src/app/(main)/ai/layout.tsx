import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import React from 'react';

interface Props {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
    return (
        <div className="flex flex-col w-full min-h-screen">
            <DashboardNavbar />
            <main className="flex lg:flex-row flex-col flex-1 size-full">
                <DashboardSidebar />
                <div className="lg:ml-72 pt-14 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;