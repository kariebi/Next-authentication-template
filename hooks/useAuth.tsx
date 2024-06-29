"use client";

import { useSelector } from 'react-redux';
import { selectAccessToken } from "@/tools/auth/authSlice";
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const token = useSelector(selectAccessToken);
    let isAdmin = false;
    let status = "User";
    let isLoggedIn = false;
    let verified = true;
    let balance = '0';
    let roles: string[] = [];

    if (token) {
        const decoded: {
            UserInfo: {
                email: string;
                username: string;
                wallet: string;
                roles: string[]
            }
        } = jwtDecode(token);

        const { email, username, wallet, roles } = decoded.UserInfo;
        isLoggedIn = true;
        verified = true;
        balance = parseFloat(wallet) > 0 ? wallet : '0.00';
        isAdmin = roles && (roles.includes('Admin') || roles.includes('admin'));
        return { username, verified, balance, email, roles, status, wallet, isAdmin, isLoggedIn };
    }

    return { username: '', roles, verified, email: '', isAdmin: false, wallet: '', isLoggedIn: false, balance: '0.00' };
}

export default useAuth;
