import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../sutils/supabaseConfig';



export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: 'Access token and refresh token are required' },
        { status: 400 }
      );
    }

    const { data: { session }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Session creation failed' },
        { status: 400 }
      );
    }

    // Get user data from our public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      // Fallback to auth user data
      return NextResponse.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        }
      }, { status: 200 });
    }

    return NextResponse.json(
      { user: userData },
      { status: 200 }
    );

  } catch (err: any) {
    console.error('Hash session error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}