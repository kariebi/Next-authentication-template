import AuthNavbar from '@/components/Navbar/AuthNavbar'
import React, { ReactNode } from 'react'

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className='min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-[--background-end]'>
            <AuthNavbar/>
            {children}
        </div>
    )
}

export default AuthLayout