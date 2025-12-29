import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const { user, response } = await updateSession(request)

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/signup', '/auth/callback', '/']
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Kid mode doesn't require Supabase auth (uses PIN-based session)
  const isKidMode = request.nextUrl.pathname.startsWith('/kid-mode')

  // Protect parent routes
  if (!isPublicPath && !isKidMode && !user) {
    return Response.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
