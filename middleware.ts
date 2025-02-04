import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define the public routes
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/api/webhook/clerk',
  '/_next/image',
  '/favicon.ico',
  '/api/(.*)',
  '/about',
  '/contact',
  '/products(.*)',
  '/categories(.*)'
];

// Define the ignored routes
const ignoredRoutes = [
  '/api/webhook/clerk',
  '/_next/static/(.*)',
  '/_next/image(.*)',
  '/favicon.ico',
  '/api/sanity/(.*)'
];

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);

  // Check for ignored routes
  if (ignoredRoutes.some(pattern => url.pathname.match(pattern))) {
    return NextResponse.next();
  }

  // Check for public routes
  if (publicRoutes.some(pattern => url.pathname.match(pattern))) {
    return NextResponse.next();
  }

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL('/auth/signin', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};
