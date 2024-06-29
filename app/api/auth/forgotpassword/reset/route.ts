import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { hashPassword } from '@/utils/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, OTP, password } = await req.json();

        const foundUser = await prisma.user.findUnique({ where: { email } })
        const foundToken = prisma.token.findUnique({
            where: {
                email,
                token: OTP,
                purpose: 'forgotpassword',
                expiresAt: {
                    gte: new Date(),
                },
            }
        })

        if (!foundToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        if (!foundUser || !foundUser.active) {
            return NextResponse.json({ error: 'You are not registered' }, { status: 401 })
        }


        const hashedpassword: string = await hashPassword(password)
        
        // Update user's password's status
        await prisma.user.update({
            where: {
                email,
            },
            data: {
                password: hashedpassword,
            },
        });

        // Delete the token after verification
        await prisma.token.deleteMany({
            where: {
                email,
                purpose: 'forgotpassword',
            },
        });

        return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
