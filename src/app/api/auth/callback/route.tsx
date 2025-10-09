import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

    if (!code) {
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'no_code')
      return NextResponse.redirect(errorUrl)
    }

    const supabase = await createClient()

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }

    if (session?.user) {
      // Ensure user record exists for OAuth users
      const { data: existingUser } = await supabase
        .from('users')
        .select('userid')
        .eq('email', session.user.email)
        .single()

      if (!existingUser) {
        await supabase
          .from('users')
          .insert([
            {
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email!,
              role: 'Member',
              phone_number: session.user.user_metadata?.phone_number || null,
              country: session.user.user_metadata?.country || null,
              company_email: session.user.user_metadata?.company_email || null,
              linkedin_profile: session.user.user_metadata?.linkedin_profile || null,
              instagram_profile: session.user.user_metadata?.instagram_profile || null,
              createdat: new Date().toISOString(),
            },
          ])
      }
    }

    // Use dynamic URL based on current request
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(`${baseUrl}${redirectTo}`)
  } catch (error) {
    console.error('Auth callback error:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    return NextResponse.redirect(errorUrl)
  }
}