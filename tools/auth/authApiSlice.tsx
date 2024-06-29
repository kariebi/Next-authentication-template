"use client"

import { toast } from "react-hot-toast";
import { apiSlice } from "@/store/api/apiSlice";
import { logOut, setAccessToken } from "./authSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    login: builder.mutation({
      query: (credentials: any) => ({
        url: '/auth/login/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    googleHandler: builder.mutation({
      query: (credentials: any) => ({
        url: '/auth/google',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    register: builder.mutation({
      query: (credentials: any) => ({
        url: '/auth/register/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    sendOTP: builder.mutation({
      query: (credentials: any) => ({
        url: '/auth/send-otp/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    verifyOTP: builder.mutation({
      query: (credentials: any) => ({
        url: '/auth/verify-otp/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    sendForgotPasswordOTP: builder.mutation({
      query: (credentials: any) => ({
        url: 'auth/forgotpassword/send-otp/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    verifyForgotPasswordOTP: builder.mutation({
      query: (credentials: any) => ({
        url: 'auth/forgotpassword/verify-otp/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    ResetPassword: builder.mutation({
      query: (credentials: any) => ({
        url: 'auth/forgotpassword/reset/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    ChangePassword: builder.mutation({
      query: (credentials: any) => ({
        url: 'auth/changepassword/',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    sendLogout: builder.mutation({
      query: (refreshToken: string) => ({
        url: '/auth/logout/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
      async onQueryStarted(arg: any, { dispatch, queryFulfilled }: any) {
        try {
          await queryFulfilled;
          console.log(arg);
          dispatch(logOut());
          window.location.href = "/login";
          toast.success('Logout Successful')
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState());
          }, 1000);
        } catch (err) {
          console.log(err);
        }
      },
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/auth/refresh/',
        method: 'POST',
        body: {},
      }),
      async onQueryStarted(arg: any, { dispatch, queryFulfilled }: any) {
        try {
          const { data } = await queryFulfilled;
          console.log(arg)
          dispatch(setAccessToken(data.accessToken));
        } catch (err) {
          console.log(err);
        }
      },
    }),
  }),
});

export const {
  useSendOTPMutation,
  useGoogleHandlerMutation,
  useResetPasswordMutation,
  useVerifyForgotPasswordOTPMutation,
  useSendForgotPasswordOTPMutation,
  useVerifyOTPMutation,
  useLoginMutation,
  useRegisterMutation,
  useChangePasswordMutation,
  useSendLogoutMutation,
  useRefreshMutation,
} = authApiSlice;
