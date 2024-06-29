import React from 'react'
import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome Back",
};

export default function Login() {
  return (
    <LoginForm />
  );
}
