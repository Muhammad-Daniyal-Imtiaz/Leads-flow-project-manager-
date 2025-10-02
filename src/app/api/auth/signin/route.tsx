import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'invalid_credentials' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'email_not_confirmed' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 400 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.user.email)
      .single();

    if (!userError && userData) {
      return NextResponse.json(
        { user: userData, message: 'Signin successful' },
        { status: 200 }
      );
    }

    // Fallback user data
    const fallbackUser = {
      userid: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
      role: data.user.role,
      createdat: data.user.created_at,
    };

    return NextResponse.json(
      { user: fallbackUser, message: 'Signin successful' },
      { status: 200 }
    );

  } catch (err: any) {
    console.error('Signin error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}