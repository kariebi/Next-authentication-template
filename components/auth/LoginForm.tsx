"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { useLoginMutation, useSendOTPMutation, useVerifyOTPMutation } from '@/tools/auth/authApiSlice';
import { PulseLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setAccessToken } from '@/tools/auth/authSlice'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";



const LoginForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: '',
    });
    const dispatch = useDispatch()
    const [isFormValid, setIsFormValid] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [login, { isLoading: isTryingtoLogin }] = useLoginMutation();
    const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
    const [verifyOTP, { isLoading: isVerifyingOTP }] = useVerifyOTPMutation();
    const [isPasswordReqVisible, showPasswordReqVisible] = useState(false)

    const GoogleAuthURL = '/api/auth/google';
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        const { password, email } = formData;

        setIsFormValid(
            !!email &&
            !!password
        );
    }, [formData]);

    useEffect(() => {
        let countdownInterval: string | number | NodeJS.Timeout | undefined;

        if (countdown > 0 && !isResendDisabled) {
            countdownInterval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(countdownInterval);
            setIsResendDisabled(false);
        }

        return () => {
            clearInterval(countdownInterval);
        };
    }, [countdown, isResendDisabled]);


    const handleSendOTP = async () => {
        try {
            const response: any = await sendOTP({ email: formData.email }).unwrap()
            if (response.error) {
                toast.error('Sorry an error occured');
                console.error(response);
            } else {
                toast.success("Your OTP has been sent");
            }
        } catch (error) {
            const err = error as FetchBaseQueryError;

            if ('status' in err) {
                switch (err.status) {
                    case 401:
                        toast.error('You are not registered');
                        break;
                    case 402:
                        toast.error('This email is already verified');
                        break;
                    default:
                        toast.error('There was an unexpected error');
                        break;
                }
            } else {
                toast.error('There was an unexpected error');
            }
            console.error(error);
        }
    }

    const handleVerifyOTP = async () => {
        try {
            const response: any = await verifyOTP({ email: formData.email, OTP: formData.otp }).unwrap()
            if (response.error) {
                toast.error('Sorry an error occured');
                console.error(response);
            } else {
                toast.success("Your OTP has been verified");
                router.push('/login')
            }
        } catch (error) {
            const err = error as FetchBaseQueryError;

            if ('status' in err) {
                switch (err.status) {
                    case 400:
                        toast.error('Invalid or expired token');
                        break;
                    default:
                        toast.error('There was an unexpected error');
                        break;
                }
            } else {
                toast.error('There was an unexpected error');
            }
            console.error(error);
        }
    }

    const handleLogin = async () => {
        if (isFormValid) {
            try {
                const response: { error: any, accessToken: string } | any = await login({
                    email: formData.email,
                    password: formData.password
                }).unwrap();
                if (response.error) {
                    toast.error('Sorry an error occured');
                } else {
                    let { accessToken } = response
                    dispatch(setAccessToken(accessToken));
                    router.push('/dashboard')
                    toast.success("Login Successful");
                }
            } catch (error) {
                const err = error as FetchBaseQueryError;

                if ('status' in err) {
                    switch (err.status) {
                        case 400:
                            toast.error('All fields are required');
                            break;
                        case 401:
                            toast.error('You are not registered');
                            break;
                        case 402:
                            toast.error('Incorrect email or Password');
                            break;
                        case 403:
                            toast.error('Please verify your email');
                            handleSendOTP()
                            setStep(3)
                            break;
                        default:
                            toast.error('There was an unexpected error');
                            break;
                    }
                } else {
                    toast.error('There was an unexpected error');
                }
                console.error(error);
            }
        } else {
            toast.error('Please fill in all fields and ensure password meets all requirements');
        }
    };


    return (
        <main className="flex h-full w-full flex-col items-center justify-center p-6">
            <div className="w-full max-w-[400px] p-2 sm:p-4 space-y-8">
                {step == 1 && (
                    <div className="space-y-4 text-center">
                        <h2 className="text-2xl font-bold text-blue-600">Sign In</h2>
                        <p className="text-sm text-gray-600">Choose your sign in method</p>
                        <button
                            onClick={() => window.location.href = GoogleAuthURL}
                            className="w-full h-[52px] flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-300"
                        >
                            <FcGoogle className="mr-2" />
                            Sign In with Google
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full h-[52px] flex items-center justify-center text-blue-600 bg-white dark:bg-black border border-blue-600 hover:bg-blue-50 rounded-md transition duration-300"
                        >
                            <FiMail className="mr-2" />
                            Sign In with Email
                        </button>
                        <aside className='mt-4 text-xs w-full flex flex-col justify-center text-center'>
                            <p className='pt-2'>
                                Don&apos;t have an account? <Link href='signup' className='signuplink hover:underline'>Create an account</Link>
                            </p>
                        </aside>
                    </div>
                )}
                {step === 2 && (
                    <>
                        <section>
                            <h2 className="text-2xl mt-5 font-bold text-blue-600">Login</h2>
                            <p className='text-xs mt-2'>Welcome back to <b>Next-Auth-Template</b></p>
                        </section>
                        <div className="space-y-4 text-sm">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => handleChange(e)}
                                className="w-full px-4 py-2 pt-2 border bg-transparent h-[48px] focus:outline-none rounded  focus:border-blue-600"
                            />
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    onFocus={() => { showPasswordReqVisible(true) }}
                                    onBlur={() => { showPasswordReqVisible(false) }}
                                    value={formData.password}
                                    onChange={(e) => handleChange(e)}
                                    className="w-full px-4 py-2 pt-2 border bg-transparent h-[48px] focus:outline-none rounded  focus:border-blue-600"
                                />
                            </div>
                        </div>
                        <section className='w-full'>
                            <section className='w-full mb-2 text-xs flex items-center justify-end text-right'>
                                <p
                                    onClick={() => { setStep(4) }}
                                    className='signuplink hover:underline hover:cursor-pointer'>
                                    Forgot Password?
                                </p>
                            </section>
                            <button
                                onClick={handleLogin}
                                disabled={!isFormValid || isTryingtoLogin}
                                className={`w-full px-4 py-2 h-[52px] mt-4 flex justify-center items-center text-center text-white bg-blue-600 rounded focus:outline-none 
                                ${!isFormValid ?
                                        'opacity-50 cursor-not-allowed'
                                        : 'cursor-pointer'
                                    }`}
                            >
                                {!isTryingtoLogin ? 'Submit' : <PulseLoader size={'8px'} color='white' />}
                            </button>
                            <aside className='mt-4 text-xs w-full flex flex-col justify-center text-center'>
                                <p className='pt-2'>
                                    Don&apos;t have an account? <Link href='signup' className='signuplink hover:underline'>Create an account</Link>
                                </p>
                            </aside>
                        </section>
                    </>
                )}
                {step === 3 && (
                    <>
                        <h2 className="text-2xl font-bold text-blue-600">Enter OTP</h2>
                        <p className="text-xs sm:text-sm mt-4">
                            A verification link has been sent to your email address{" "}
                            <span className="text-blue-600">{formData.email}</span>. Please copy the OTP provided in the mail to verify and proceed to change your pasword.
                        </p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="otp"
                                placeholder="OTP"
                                value={formData.otp}
                                onChange={(e) => handleChange(e)}
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                        </div>
                        <button
                            onClick={handleVerifyOTP}
                            className="w-full px-4 py-2 mt-4 h-[52px] text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            {isVerifyingOTP ?
                                <PulseLoader size="8px" color='white' /> :
                                'Submit'
                            }
                        </button>
                        <div className='text-sm'>
                            <p>Haven&apos;t gotten your code yet? &nbsp;
                                {countdown > 0 ?
                                    <span className="text-secondary"> Resend Link in <span className="">{countdown}s</span></span>
                                    :
                                    <span
                                        onClick={handleSendOTP}
                                        className="text-blue-600">
                                        {isSendingOTP ? (
                                            <PulseLoader size="8px" color='blue' />
                                        ) : (
                                            "Resend OTP"
                                        )}</span>
                                }
                            </p>
                        </div>
                    </>
                )}
                {step === 4 && (
                    <ForgotPasswordForm initialEmail={formData.email} />
                )}
            </div>
        </main>
    );
}

export default LoginForm