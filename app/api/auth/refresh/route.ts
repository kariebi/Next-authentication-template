import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/utils/prisma'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
    const cookieStore = cookies();
    const jwtCookie = cookieStore.get('jwt');

    console.log('JWT cookie:', jwtCookie);

    if (!jwtCookie) return NextResponse.json({ message: 'Invalid, null or expired token' }, { status: 401 });

    const refreshToken = jwtCookie.value;

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

        console.log(decoded)

        const foundUser = await prisma.user.findUnique({ where: { username: (decoded as any).username as string } });

        if (!foundUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 402 });

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username,
                    roles: foundUser.roles,
                    verified: foundUser.verified,
                    email: foundUser.email,
                    userId: foundUser.id,
                },
            },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m' }
        );

        return NextResponse.json({ accessToken });
    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: 'Unexpected Error' }, { status: 500 });
    }
}
