import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  const { email, OTP } = await req.json();

  try {
    // Fetch token from database
    const token = await prisma.token.findFirst({
      where: {
        email,
        token: OTP,
        purpose: 'forgotpassword',
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    // Check if token exists
    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
