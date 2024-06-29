"use client"

import React, { useState, useEffect } from 'react'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { useSendForgotPasswordOTPMutation, useVerifyForgotPasswordOTPMutation, useResetPasswordMutation } from '@/tools/auth/authApiSlice';
import { PulseLoader } from 'react-spinners';
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation';
import { IoIosCheckmarkCircle } from 'react-icons/io';

const ForgotPasswordForm = ({ initialEmail }: { initialEmail: string }) => {
  const router = useRouter()

  const [email, setEmail] = useState(initialEmail || '')
  const [OTP, setOTP] = useState('')
  const [password, setPassword] = useState('')
  const [isFormValid, setIsFormValid] = useState(false);
  const [confirm_password, setConfirmPassword] = useState('')
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false)
  const [isOTPVerified, setIsOTPVerified] = useState(false)
  const [sendOTP, { isLoading: isSendingOTP }] = useSendForgotPasswordOTPMutation();
  const [verifyOTP, { isLoading: isVerifyingOTP }] = useVerifyForgotPasswordOTPMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const [countdown, setCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState([
    { check: false, label: 'At least 10 characters' },
    { check: false, label: 'At least one uppercase letter' },
    { check: false, label: 'At least one lowercase letter' },
    { check: false, label: 'At least one number' },
    { check: false, label: 'At least one special character' },
    { check: false, label: 'Confirm password is same as password' },
  ]);

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
      const response: any = await sendOTP({ email }).unwrap()
      if (response.error) {
        toast.error('Sorry an error occurred');
        console.error(response);
      } else {
        toast.success("Your OTP has been sent");
        setIsEmailSubmitted(true);
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
  }

  const handleVerifyOTP = async () => {
    try {
      const response: any = await verifyOTP({ email, OTP }).unwrap()
      if (response.error) {
        toast.error('Sorry an error occurred');
        console.error(response);
      } else {
        toast.success("Your OTP has been verified");
        setIsOTPVerified(true);
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
  }

  const handleResetPassword = async () => {
    try {
      const response: any = await resetPassword({ email, OTP, password }).unwrap()
      if (response.error) {
        toast.error('Sorry an error occurred');
        console.error(response);
      } else {
        toast.success("Your password has been reset");
        router.push('/login')
      }
    } catch (error) {
      const err = error as FetchBaseQueryError;

      if ('status' in err) {
        switch (err.status) {
          case 400:
            toast.error('Invalid or expired token');
            break;
          case 401:
            toast.error('You are not registered');
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
  }

  const validatePassword = (password: string) => {
    const length = password.length >= 10;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passwordsMatch = password === confirm_password && password !== '' && confirm_password !== '';


    setPasswordRequirements([
      { check: length, label: 'At least 10 characters' },
      { check: uppercase, label: 'At least one uppercase letter' },
      { check: lowercase, label: 'At least one lowercase letter' },
      { check: number, label: 'At least one number' },
      { check: specialChar, label: 'At least one special character' },
      { check: passwordsMatch, label: 'Confirm password is same as password' },
    ]);
  }

  useEffect(() => {
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const passwordsMatch = password === confirm_password && password !== '' && confirm_password !== '';

    setIsFormValid(
      length &&
      uppercase &&
      number &&
      lowercase &&
      specialChar &&
      passwordsMatch &&
      !!OTP &&
      !!email
    );
  }, [password, confirm_password, email, OTP]);


  useEffect(() => {
    validatePassword(password);
  }, [password, confirm_password]);


  return (
    <div>
      {!isEmailSubmitted && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Enter Email</h2>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-600 mt-4"
          />
          <button
            onClick={handleSendOTP}
            className="w-full px-4 py-2 mt-4 h-[52px] text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {isSendingOTP ? <PulseLoader size="8px" color='#fff' /> : 'Send OTP'}
          </button>
        </>
      )}

      {isEmailSubmitted && !isOTPVerified && (
        <>
          <h2 className="text-2xl font-bold text-blue-600">Enter OTP</h2>
          <p className="text-xs sm:text-sm mt-4 mb-8">
            A verification code has been sent to your email address{" "}
            <span className="text-blue-600">{email}</span>. Please enter the OTP to verify.
          </p>
          <div className="space-y-4">
            <input
              type="text"
              name="otp"
              placeholder="OTP"
              value={OTP}
              onChange={(e) => setOTP(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            onClick={handleVerifyOTP}
            className="w-full px-4 py-2 mt-8 h-[52px] text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {isVerifyingOTP ? <PulseLoader size="8px" color='#fff' /> : 'Verify OTP'}
          </button>
          <div className='text-sm w-full mt-4 flex items-center justify-center text-center'>
            <p>Haven&apos;t received your code yet? &nbsp;
              {countdown > 0 ?
                <span className="signuplink"> Resend code in <span className="">{countdown}s</span></span>
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

      {isOTPVerified && (
        <>
          <h2 className="text-2xl font-bold text-blue-600">Reset Password</h2>
          <div className="space-y-4 mt-8">
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm New Password"
              value={confirm_password}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <ul className="text-xs space-y-1 mt-6">
              {passwordRequirements.map((req, index) => (
                <li key={index} className={`flex items-center ${req.check ? 'text-blue-600' : 'text-gray-400'}`}>
                  <IoIosCheckmarkCircle className='mr-2' />
                  <span>{req.label}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleResetPassword}
              className={`w-full px-4 py-2 mt-8 h-[52px] text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isResettingPassword ? <PulseLoader size="8px" color='#fff' /> : 'Reset Password'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ForgotPasswordForm;
