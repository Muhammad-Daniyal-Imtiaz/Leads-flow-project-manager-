import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Auth signin error:', authError)
      
      if (authError.message.includes('Invalid login credentials') || authError.code === 'invalid_credentials') {
        return NextResponse.json(
          { error: 'invalid_credentials' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'email_not_confirmed' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 400 }
      )
    }

    // Get user data
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authData.user.email)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError)
    }

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: dbUser || {
        userid: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
        role: 'Member',
        phone_number: authData.user.user_metadata?.phone_number || null,
        country: authData.user.user_metadata?.country || null,
        company_email: authData.user.user_metadata?.company_email || null,
        linkedin_profile: authData.user.user_metadata?.linkedin_profile || null,
        instagram_profile: authData.user.user_metadata?.instagram_profile || null,
        createdat: authData.user.created_at,
      }
    })
    
  } catch (error: unknown) {
    console.error('Signin error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Signin failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}