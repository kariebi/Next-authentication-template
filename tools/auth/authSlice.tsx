"use client";

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Define the initial state type
interface AuthState {
  accessToken: string | null;
}

// Initial state
const initialState: AuthState = {
  accessToken: null,
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    logOut: (state) => {
      state.accessToken = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem('persist');
      }
    },
  },
});

// Export actions
export const { setAccessToken, logOut } = authSlice.actions;

// Export the reducer
export default authSlice.reducer;

// Selector to get the accessToken
export const selectAccessToken = (state: RootState) => state.auth.accessToken;

