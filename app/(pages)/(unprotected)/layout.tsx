"use client"

import Navbar from "@/components/Navbar";


const UnProtectedLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <main className="w-full min-h-[calc(100vh-64px)] flex flex-col justify-center">
            <Navbar />
            {children}
        </main>
    );
}

export default UnProtectedLayout;