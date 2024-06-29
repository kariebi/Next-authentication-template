import React from 'react'
import type { Metadata } from "next";
import SignUpForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: "Get Started",
};


const SignUp = () => {
  return (
    <SignUpForm />
  )
}

export default SignUp