import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@/utils/prisma';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ success: false, message: 'Code not provided' }, { status: 400 });
    }

    try {
        const { tokens } = await client.getToken(code);
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        let user = await prisma.user.findUnique({ where: { email: data.email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    username: data.email.split('@')[0], 
                    firstname: data.given_name,
                    lastname: data.family_name || '',
                    email: data.email,
                    password: '',
                    verified: true,
                    isGoogleUser: true,
                    roles: ['User'],
                },
            });
        }

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    userId: user.id,
                    verified: user.verified,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { username: user.username },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' }
        );

        const response = NextResponse.redirect(`/dashboard`);
        response.cookies.set('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
