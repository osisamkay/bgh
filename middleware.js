import { NextResponse } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/register',
    '/api/auth/verify-email',
    '/api/auth/reset-password',
    '/api/auth/refresh-token'
];

// Paths that require admin role
const adminPaths = [
    '/admin',
    '/api/admin'
];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow access to public paths
    if (publicPaths.some(path => pathname.startsWith(path)) ||
        pathname.includes('/_next') ||
        pathname.includes('/public')) {
        return NextResponse.next();
    }

    // Check for auth token
    const token = request.cookies.get('refreshToken')?.value ||
        request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        // Redirect to login if no token is found
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // For admin paths, verify admin role
    if (adminPaths.some(path => pathname.startsWith(path))) {
        try {
            // Simple JWT verification (in a real app, this would verify against the backend)
            const payload = JSON.parse(
                Buffer.from(token.split('.')[1], 'base64').toString()
            );

            if (payload.role !== 'ADMIN') {
                // Redirect non-admin users away from admin pages
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (error) {
            // Invalid token, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};