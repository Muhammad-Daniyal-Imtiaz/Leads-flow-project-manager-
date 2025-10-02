import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Use Supabase's callback URL directly
    const supabaseCallbackUrl = 'https://vxilxjdjotamvuzrblcd.supabase.co/auth/v1/callback';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: supabaseCallbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error.message);
      return NextResponse.redirect(`${baseUrl}/loginn?error=auth_failed`);
    }

    if (data?.url) {
      return NextResponse.redirect(data.url);
    }

    console.error('No redirect URL received from Supabase');
    return NextResponse.redirect(`${baseUrl}/loginn?error=no_redirect_url`);
  } catch (err: any) {
    console.error('Google auth error:', err.message);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/loginn?error=server_error`);
  }
}