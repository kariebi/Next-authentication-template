"use client";

import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import useAuth from '../../hooks/useAuth';

interface RequireAuthProps {
    allowedRoles: string[];
    children: ReactNode;
}

const RequireAuth = ({ allowedRoles, children }: RequireAuthProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { roles } = useAuth();

    if (roles.length === 0 || !roles.some((role: string) => allowedRoles.includes(role))) {
        if (typeof window !== 'undefined') {
            router.replace('/login?from=' + encodeURIComponent(pathname));
        }
        return null;
    }

    return <>{children}</>;
};

export default RequireAuth;
