import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name, phone_number, country, company_email, linkedin_profile, instagram_profile } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('userid')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Server error during signup' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'email_exists' },
        { status: 400 }
      )
    }

    // Get the base URL from the request for dynamic redirect
    const baseUrl = new URL(request.url).origin
    
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone_number: phone_number || null,
          country: country || null,
          company_email: company_email || null,
          linkedin_profile: linkedin_profile || null,
          instagram_profile: instagram_profile || null,
        },
        emailRedirectTo: `${baseUrl}/dashboard`,
      },
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      
      if (authError.message.includes('already registered') || authError.code === 'user_already_exists') {
        return NextResponse.json(
          { error: 'email_exists' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('password')) {
        return NextResponse.json(
          { error: 'weak_password' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (authData.user) {
      // Create user record in the database
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            name: name,
            email: email,
            role: 'Member',
            phone_number: phone_number || null,
            country: country || null,
            company_email: company_email || null,
            linkedin_profile: linkedin_profile || null,
            instagram_profile: instagram_profile || null,
            createdat: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (userError) {
        console.error('Error creating user record:', userError)
        return NextResponse.json(
          { 
            success: true,
            message: 'Account created but there was an issue with profile setup. Please contact support.',
            user: null
          },
          { status: 201 }
        )
      }
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: authData.session 
        ? 'Signup successful! Redirecting...' 
        : 'Please check your email to verify your account before signing in.',
      user: authData.user ? {
        userid: authData.user.id,
        email: authData.user.email,
        name: name,
        role: 'Member',
        phone_number: phone_number || null,
        country: country || null,
        company_email: company_email || null,
        linkedin_profile: linkedin_profile || null,
        instagram_profile: instagram_profile || null,
        createdat: new Date().toISOString(),
      } : null
    })
    
  } catch (error: unknown) {
    console.error('Signup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Signup failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}