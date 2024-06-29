"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { useRegisterMutation, useSendOTPMutation, useVerifyOTPMutation } from '@/tools/auth/authApiSlice';
import { PulseLoader } from 'react-spinners';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";


const SignUpForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirm_password: '',
        otp: '',
    });
    const [passwordValidity, setPasswordValidity] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
    });
    const [countdown, setCountdown] = useState(30);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [register, { isLoading: isRegistering }] = useRegisterMutation();
    const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
    const [verifyOTP, { isLoading: isVerifyingOTP }] = useVerifyOTPMutation();
    const [isPasswordReqVisible, showPasswordReqVisible] = useState(false);

    const GoogleAuthURL = `${process.env.ROOT_URL}/api/auth/google`;
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        const { password, confirm_password, firstName, lastName, email } = formData;
        const length = password.length >= 10;
        const uppercase = /[A-Z]/.test(password);
        const lowercase = /[a-z]/.test(password);
        const number = /[0-9]/.test(password);
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const passwordsMatch = password === confirm_password;

        setPasswordValidity({ length, uppercase, lowercase, number, specialChar });

        setIsFormValid(
            length &&
            uppercase &&
            number &&
            lowercase &&
            specialChar &&
            passwordsMatch &&
            !!firstName &&
            !!lastName &&
            !!email
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
            const response: any = await sendOTP({ email: formData.email }).unwrap();
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
        setCountdown(30);
        setIsResendDisabled(true);
    };

    const handleVerifyOTP = async () => {
        try {
            const response: any = await verifyOTP({ email: formData.email, OTP: formData.otp }).unwrap();
            if (response.error) {
                toast.error('Sorry an error occured');
                console.error(response);
            } else {
                toast.success("Your OTP has been verified");
                router.push('/login');
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
        setCountdown(30);
        setIsResendDisabled(true);
    };

    const handleRegistration = async () => {
        if (isFormValid) {
            try {
                const response: any = await register({
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    email: formData.email,
                    password: formData.password
                }).unwrap();
                if (response.error) {
                    toast.error('Sorry an error occured');
                    console.error(response);
                } else {
                    toast.success("Your OTP has been sent");
                    setStep(3);
                }
            } catch (error) {
                const err = error as FetchBaseQueryError;

                if ('status' in err) {
                    switch (err.status) {
                        case 400:
                            toast.error('Email is already taken');
                            break;
                        case 401:
                            toast.error('Name is required and Password should be a minimum of 10 characters');
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
            toast.error('Please fill in all fields and ensure the password meets all requirements');
        }
    };

    const passwordRequirements = [
        { check: passwordValidity.length, label: 'At least 10 characters' },
        { check: passwordValidity.uppercase, label: 'At least one uppercase letter' },
        { check: passwordValidity.lowercase, label: 'At least one lowercase letter' },
        { check: passwordValidity.number, label: 'At least one number' },
        { check: passwordValidity.specialChar, label: 'At least one special character' },
    ];

    return (
        <main className="flex h-full w-full flex-col items-center justify-center p-6">
            <div className="w-full max-w-[400px] p-2 sm:p-4 space-y-8">
                {step == 1 && (
                    <div className="space-y-4 text-center">
                        <h2 className="text-2xl font-bold text-blue-600">Sign Up</h2>
                        <p className="text-sm text-gray-600">Choose your sign up method</p>
                        <button
                            onClick={() => window.location.href = GoogleAuthURL}
                            className="w-full h-[52px] flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-300"
                        >
                            <FcGoogle className="mr-2" />
                            Sign up with Google
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full h-[52px] flex items-center justify-center text-blue-600 bg-white dark:bg-black border border-blue-600 hover:bg-blue-50 rounded-md transition duration-300"
                        >
                            <FiMail className="mr-2" />
                            Sign up with Email
                        </button>
                        <aside className='mt-4 text-xs w-full flex flex-col justify-center text-center'>
                            <p className='pt-2'>
                                Already have an account? <Link href='login' className='text-blue-600 hover:underline'>Login</Link>
                            </p>
                        </aside>
                    </div>
                )}
                {step === 2 && (
                    <>
                        <section>
                            <h2 className="text-2xl mt-5 font-bold text-blue-600">Register</h2>
                            <p className='text-xs mt-2'>Get your account started with <b>Next-Auth-Template</b></p>
                        </section>
                        <div className="space-y-4 text-sm">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => handleChange(e)}
                                className="w-full px-4 py-2 pt-2 border bg-transparent h-[48px] focus:outline-none rounded  focus:border-blue-600"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => handleChange(e)}
                                className="w-full px-4 py-2 pt-2 border bg-transparent h-[48px] focus:outline-none rounded  focus:border-blue-600"
                            />
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
                                {isPasswordReqVisible &&
                                    <ul className="text-xs space-y-1 mt-2">
                                        {passwordRequirements.map((req, index) => (
                                            <li key={index} className={`flex items-center ${req.check ? 'text-blue-600' : 'text-gray-400'}`}>
                                                <IoIosCheckmarkCircle className='mr-2' />
                                                <span>{req.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>
                            <input
                                type="password"
                                name="confirm_password"
                                placeholder="Confirm Password"
                                value={formData.confirm_password}
                                onChange={(e) => handleChange(e)}
                                className="w-full px-4 py-2 pt-2 border bg-transparent h-[48px] focus:outline-none rounded  focus:border-blue-600"
                            />
                        </div>
                        <section className='w-full'>
                            <button
                                onClick={handleRegistration}
                                disabled={!isFormValid || isRegistering}
                                className={`w-full px-4 py-2 h-[52px] mt-4 flex justify-center items-center text-center text-white bg-blue-600 rounded focus:outline-none 
                                ${!isFormValid ?
                                        'opacity-50 cursor-not-allowed'
                                        : 'cursor-pointer'
                                    }`}
                            >
                                {!isRegistering ? 'Submit' : <PulseLoader size={'8px'} color='white' />}
                            </button>
                            <aside className='mt-4 text-xs w-full flex flex-col justify-center text-center'>
                                <p className='pt-2'>
                                    Already have an account? <Link href='login' className='text-blue-600 hover:underline'>Login</Link>
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
                            {
                                isVerifyingOTP?
                                <PulseLoader size="8px" color='#fff' />
                                :'Submit OTP'
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
            </div>
        </main>
    );
};

export default SignUpForm;