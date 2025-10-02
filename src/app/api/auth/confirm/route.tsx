import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../sutils/supabaseConfig';



export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token_hash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');
    const next = url.searchParams.get('next') || '/loginn';

    if (token_hash && type === 'signup') {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup',
      });

      if (error) {
        console.error('Email confirmation error:', error.message);
        return NextResponse.redirect(new URL(`${next}?error=confirmation_failed`, request.url));
      }

      if (data.user) {
        return NextResponse.redirect(new URL(`${next}?success=email_confirmed`, request.url));
      }
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch (err) {
    console.error('Confirmation error:', err);
    return NextResponse.redirect(new URL('/loginn?error=confirmation_failed', request.url));
  }
}