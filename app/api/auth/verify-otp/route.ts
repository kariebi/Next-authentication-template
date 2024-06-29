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
        purpose: 'email',
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    // Check if token exists
    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Update user's verified status
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        verified: true,
      },
    });

    // Delete the token after verification
    await prisma.token.deleteMany({
      where: {
        email,
        purpose: 'email',
      },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
