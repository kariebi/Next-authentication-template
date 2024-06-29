"use client"

import DashNavbar from "@/components/Navbar/DashNavbar";
import { ROLES } from "@/config/roles";
import PersistLogin from "@/tools/auth/PersistLogin";
import RequireAuth from "@/tools/auth/RequireAuth";

const ProtectedLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <PersistLogin>
            <RequireAuth allowedRoles={[...Object.values(ROLES)]} >
                <main className="container min-h-[calc(100vh-64px)] flex items-center justify-center">
                    <DashNavbar />
                    {children}
                </main>
            </RequireAuth>
        </PersistLogin>

    );
}

export default ProtectedLayout;