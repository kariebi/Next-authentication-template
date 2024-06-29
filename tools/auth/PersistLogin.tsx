"use client";

import { useEffect, useRef, useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRefreshMutation } from './authApiSlice';
import usePersist from '@/hooks/usePersist';
import { useSelector } from 'react-redux';
import {
    selectAccessToken,
} from './authSlice';
import PulseLoader from 'react-spinners/PulseLoader';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import Loader from '@/components/Loader';

const PersistLogin = ({ children }: { children: React.ReactNode }) => {
    const [persist] = usePersist();
    const accesstoken = useSelector(selectAccessToken);
    const effectRan = useRef(false);

    const [trueSuccess, setTrueSuccess] = useState(false);

    const [refresh, {
        isUninitialized,
        isLoading,
        isSuccess,
        isError,
        error
    }] = useRefreshMutation();

    // const router = useRouter();

    useEffect(() => {
        // Run the effect only once
        if (typeof window !== 'undefined' && (effectRan.current === false || process.env.NODE_ENV !== 'development')) {
            const verifyRefreshToken = async () => {
                try {
                    await refresh({}).unwrap();
                    setTrueSuccess(true);
                } catch (err) {
                    // Handle error during refresh token verification
                }
            };

            // Verify refresh token only if there's no token and persistence is enabled
            if (!accesstoken && persist) {
                verifyRefreshToken();
            }

            // Mark the effect as run
            effectRan.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Dependencies array is intentionally empty to run the effect only once

    let content;
    if (!persist) {
        content = <>{children}</>;
    } else if (isLoading) {
        content = <div className='w-full h-full flex items-center justify-center'>
           <Loader/>
        </div>;
    } else if (isError) {
        if ((error as FetchBaseQueryError)?.status === 401) {
            <>{children}</>
        } else {
            const errorMessage =
                ((error as FetchBaseQueryError)?.data as { message?: string })
                    ?.message || '';
            content = (
                <p className='errmsg'>
                    {`${errorMessage} - `}
                    <Link href="/login">Please login again</Link>.
                </p>
            );
        }
    } else if (isSuccess && trueSuccess) {
        content = <>{children}</>;
    } else if (accesstoken && isUninitialized) {
        content = <>{children}</>;
    }

    return content;
};

export default PersistLogin;
