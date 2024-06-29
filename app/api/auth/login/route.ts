import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import jwt from 'jsonwebtoken'
import { comparePassword } from '@/utils/auth'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        console.log('Request received:', { email, password })

        if (!email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        const foundUser = await prisma.user.findUnique({ where: { email } })


        console.log('Found user:', foundUser)

        if (!foundUser?.active) {
            return NextResponse.json({ error: 'You are not registered' }, { status: 401 })
        }

        if (!foundUser.verified) {
            return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
        }

        const passwordsMatch = await comparePassword(password, foundUser.password)

        if (!passwordsMatch) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 402 })
        }

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    userId: foundUser.id,
                    verified: foundUser.verified,
                    email: foundUser.email,
                    username: foundUser.username,
                    roles: foundUser.roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' }
        )

        const response = NextResponse.json({ accessToken })
        response.cookies.set('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        return response
    } catch (error) {
        console.error('Error processing request:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
