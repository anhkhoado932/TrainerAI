import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Use getUser() for secure authentication verification
  const { data: { user } } = await supabase.auth.getUser()

  // If there's no user and the user is trying to access protected routes
  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', req.url)
    // Add the original URL as a query parameter so we can redirect after login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a user and the user is trying to access auth pages
  if (user && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

// Specify which routes should be handled by the middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
} 