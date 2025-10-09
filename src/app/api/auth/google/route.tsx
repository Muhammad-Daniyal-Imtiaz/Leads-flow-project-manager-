// src/app/api/auth/google/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const redirectTo = searchParams.get('redirectTo') || '/dashboard'
    
    // Use dynamic base URL from the current request
    const baseUrl = new URL(request.url).origin
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      console.error('Google OAuth error:', error)
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }

    return NextResponse.redirect(data.url)
  } catch (error) {
    console.error('Google OAuth route error:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    return NextResponse.redirect(errorUrl)
  }
}