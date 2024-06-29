import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { generateRandomToken, sendVerificationEmail } from '@/utils/auth';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const foundUser = await prisma.user.findUnique({ where: { email } })

  if (!foundUser) {
    return NextResponse.json({ error: 'Unregistered account' }, { status: 401 })
  }
  if (foundUser?.verified) {
    return NextResponse.json({ error: 'This email is already verified' }, { status: 402 })
  }

  try {
    // Delete any existing tokens
    await prisma.token.deleteMany({
      where: {
        email,
        purpose: 'email',
      },
    });

    // Generate new OTP
    const newOTP = generateRandomToken();

    // Create new token
    await prisma.token.create({
      data: {
        email,
        token: newOTP,
        purpose: 'email',
        expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes from now
      },
    });

    // Send OTP email to the user
    await sendVerificationEmail(email, newOTP, foundUser.firstname)

    return NextResponse.json({ message: 'New OTP created and sent successfully' });
  } catch (error) {
    console.error('Error creating new OTP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
