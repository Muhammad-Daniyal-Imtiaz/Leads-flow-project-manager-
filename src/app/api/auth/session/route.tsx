import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!session?.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Try to get user data from public.users table first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!userError && userData) {
      return NextResponse.json({ user: userData }, { status: 200 });
    }

    // Fallback to auth user data
    const user = {
      userid: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
      role: session.user.role,
      createdat: session.user.created_at,
    };

    return NextResponse.json({ user }, { status: 200 });

  } catch (err: any) {
    console.error('Session API error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}