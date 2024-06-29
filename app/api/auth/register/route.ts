import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { hashPassword, sendVerificationEmail, generateRandomToken } from '@/utils/auth'

export async function POST(req: NextRequest) {
    const { firstname, lastname, email, password } = await req.json()

    if (!lastname || !firstname || !password || password.length < 10) {
        return NextResponse.json({ error: 'Name is required and Password should be at least 10 characters long' }, { status: 401 })
    }

    const exist = await prisma.user.findUnique({ where: { email } })
    if (exist) {
        return NextResponse.json({ error: 'Email is already taken' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
        data: {
            username: email.split('@')[0],
            firstname,
            lastname,
            email: email,
            password: hashedPassword,
            isGoogleUser: false,
            roles: ['User'],
        },
    })

    const newOTP = generateRandomToken()

    await prisma.token.create({
        data: {
            email: user.email,
            token: newOTP,
            purpose: 'email',
            expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes from now
        },
    })

    await sendVerificationEmail(user.email, newOTP, firstname)

    return NextResponse.json({ message: 'Registered Successfully' })
}
