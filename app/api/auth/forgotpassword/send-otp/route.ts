import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { generateRandomToken, sendPasswordResetEmail } from '@/utils/auth';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const foundUser = await prisma.user.findUnique({ where: { email } })

  if (!foundUser || !foundUser.active) {
      return NextResponse.json({ error: 'You are not registered' }, { status: 401 })
  }
  
  try {
    // Delete any existing tokens
    await prisma.token.deleteMany({
      where: {
        email,
        purpose: 'forgotpassword',
      },
    });

    // Generate new OTP
    const newOTP = generateRandomToken();

    // Create new token for forgot password
    await prisma.token.create({
      data: {
        email,
        token: newOTP,
        purpose: 'forgotpassword',
        expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes from now
      },
    });

    // Send OTP email to the user
    await sendPasswordResetEmail(email, newOTP, foundUser.firstname);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
