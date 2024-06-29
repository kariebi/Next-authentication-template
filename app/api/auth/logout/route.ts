import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ message: 'Cookie cleared' })
    response.cookies.set('jwt', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 0,
    })
    return response
}
