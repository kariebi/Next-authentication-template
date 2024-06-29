"use client"

import React from 'react'
import { useSendLogoutMutation } from '@/tools/auth/authApiSlice'
import { PulseLoader } from 'react-spinners'
import { toast } from 'react-hot-toast'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { useRouter } from 'next/navigation'


const DashNavbar = () => {
    const [Logout, { isLoading: isLoggingOut }] = useSendLogoutMutation()
    const router = useRouter()
    const HandleLogout = async () => {
        try {
            Logout({}).unwrap()
            toast.success('Logout successful')
            router.push('/')

        } catch (err) {
            const error = err as FetchBaseQueryError
            toast.success('Error Logging out')
            console.error(error)
        }
    }
    return (
        <div className='h-16 px-2 fixed w-full top-0 left-0 flex items-center justify-between'>
            <h1
                onClick={() => {
                    window.location.href = '/'
                }}
                className='font-semibold text-xl hover:cursor-pointer'
            >NextJS-Template</h1>
            <button
                className='py-2 px-3 h-[52px] bg-blue-600 rounded-full'
                type='button'
                onClick={HandleLogout}>
                {
                    isLoggingOut ?
                        <PulseLoader size='8px' className='text-white dark:text-white' /> :
                        'Logout'
                }
            </button>
        </div>
    )
}

export default DashNavbar