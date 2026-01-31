import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=No authorization code received', request.url)
    );
  }

  // In a real implementation:
  // 1. Exchange code for access token with Google
  // 2. Get YouTube channel info
  // 3. Save tokens to Supabase social_accounts table

  return NextResponse.redirect(
    new URL('/settings?success=youtube_connected', request.url)
  );
}
