import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const error = url.searchParams.get('error');
    const code = url.searchParams.get('code');
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/loginn?error=auth_failed`);
    }

    if (!code) {
      console.error('No authentication code found');
      return NextResponse.redirect(`${baseUrl}/loginn?error=no_code`);
    }

    // Exchange the code for a session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Session exchange error:', sessionError.message);
      
      // Check if it's a PKCE error and provide specific guidance
      if (sessionError.message.includes('code verifier')) {
        console.error('PKCE error - make sure Google Cloud Console redirect URI is correct');
        return NextResponse.redirect(`${baseUrl}/loginn?error=pkce_error`);
      }
      
      return NextResponse.redirect(`${baseUrl}/loginn?error=session_error`);
    }

    if (data?.session) {
      console.log('Authentication successful for user:', data.session.user.email);
      return NextResponse.redirect(`${baseUrl}/loginn?success=google_signin`);
    }

    console.error('No session data received');
    return NextResponse.redirect(`${baseUrl}/loginn?error=no_session`);

  } catch (err) {
    console.error('Callback error:', err);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/loginn?error=server_error`);
  }
}