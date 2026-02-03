import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper to get cookie value
function getCookieValue(request: NextRequest, name: string): string | null {
  const cookie = request.cookies.get(name);
  return cookie?.value || null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=No authorization code received', request.url)
    );
  }

  try {
    // Get the code verifier from cookies
    const codeVerifier = getCookieValue(request, 'twitter_code_verifier');
    
    if (!codeVerifier) {
      console.error('No code verifier found in cookies');
      return NextResponse.redirect(
        new URL('/settings?error=Authentication session expired. Please try again.', request.url)
      );
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/settings?error=Failed to exchange token', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    
    // Get user info from Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    
    // Get current user from Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=Not authenticated', request.url)
      );
    }

    // Save to social_accounts table
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: user.id,
        platform: 'twitter',
        account_name: userData.data.username,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        platform_user_id: userData.data.id,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) {
      console.error('Failed to save account:', dbError);
      return NextResponse.redirect(
        new URL('/settings?error=Failed to save account', request.url)
      );
    }

    // Clear the cookies after successful authentication
    const response = NextResponse.redirect(
      new URL('/settings?success=twitter_connected', request.url)
    );
    response.cookies.delete('twitter_code_verifier');
    response.cookies.delete('twitter_state');
    return response;
    
  } catch (err) {
    console.error('Twitter callback error:', err);
    return NextResponse.redirect(
      new URL('/settings?error=Authentication failed', request.url)
    );
  }
}
