import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Redirect to Google OAuth endpoint
    const redirectUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=email%20profile&state=some_state`;

    return NextResponse.redirect(redirectUrl);
};
