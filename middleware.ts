import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  /^\/$/, // home
  /^\/public-page/,
  /^\/api\/public\/.*/,
];

const AUTH_PATHS = [
  /^\/login/,
  /^\/signup/,
  /^\/forgot-password/,
  /^\/reset-password/,
];

function matches(pathname: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = await getSessionCookie(request);

  const isPublicPath = matches(pathname, PUBLIC_PATHS);
  const isAuthPath = matches(pathname, AUTH_PATHS);

  // 1️⃣ Public routes → always allow
  if (isPublicPath || (isAuthPath && !sessionCookie)) {
    return NextResponse.next();
  }

  // 2️⃣ Auth pages → block logged-in users
  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3️⃣ Protected routes → require login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4️⃣ Everything else → allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
