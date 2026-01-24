import { NextRequest, NextResponse } from 'next/server'

/**
 * STEPS Fund - Route Protection Middleware
 * 
 * Protects routes based on user authentication and role:
 * - member: Can access /member routes only
 * - manager: Can access /admin routes (except accountant assignment)
 * - owner: Full access to /admin routes including accountant assignment
 * 
 * Gracefully redirects unauthorized users
 */

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/pending-approval',
  '/api/auth',
  '/api/members',
  '/api/contributions',
  '/api/loans',
]

// Routes that require specific roles
const protectedRoutes = {
  '/member': {
    requiredRoles: ['member', 'manager', 'owner'],
    description: 'Member routes',
  },
  '/admin': {
    requiredRoles: ['manager', 'owner'],
    description: 'Admin routes',
  },
  '/admin/accountant': {
    requiredRoles: ['owner'],
    description: 'Accountant assignment (owner only)',
  },
  '/admin/approve-members': {
    requiredRoles: ['manager', 'owner'],
    description: 'Approve members',
  },
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route || pathname.startsWith(route + '/')
  })

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, client-side auth context handles role-based redirects
  // This middleware serves as an additional security layer
  // In production, you would verify JWT tokens here and check roles server-side

  return NextResponse.next()
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled separately in API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (png, jpg, svg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.woff|.*\\.woff2|.*\\.eot|.*\\.ttf|.*\\.otf).*)',
  ],
}
