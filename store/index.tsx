"use client";

import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from '@/store/api/apiSlice';
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from '@/tools/auth/authSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
