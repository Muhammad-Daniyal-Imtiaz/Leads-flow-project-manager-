import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError)
    }

    return NextResponse.json({ 
      user: dbUser || {
        userid: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        role: 'Member',
        phone_number: user.user_metadata?.phone_number || null,
        country: user.user_metadata?.country || null,
        company_email: user.user_metadata?.company_email || null,
        linkedin_profile: user.user_metadata?.linkedin_profile || null,
        instagram_profile: user.user_metadata?.instagram_profile || null,
        createdat: user.created_at,
      }
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}