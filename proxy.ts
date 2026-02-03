// proxy.ts
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [/^\/$/, /^\/public-page/, /^\/api\/public\/.*/];

const AUTH_PATHS = [
  /^\/login/,
  /^\/signup/,
  /^\/forgot-password/,
  /^\/reset-password/,
];

function matches(pathname: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(pathname));
}

// Dalam konvensyen 'proxy', kita gunakan export default function
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil session
  const sessionCookie = await getSessionCookie(request);

  const isPublicPath = matches(pathname, PUBLIC_PATHS);
  const isAuthPath = matches(pathname, AUTH_PATHS);

  // 1️⃣ Laluan awam atau login/signup tanpa session
  if (isPublicPath || (isAuthPath && !sessionCookie)) {
    return NextResponse.next();
  }

  // 2️⃣ Dah login tapi nak pergi ke login page -> hantar ke dashboard
  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3️⃣ Protected routes -> perlukan login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Matcher tetap diperlukan untuk tapis trafik mana yang perlu melalui proxy ini
export const config = {
  matcher: [
    "/((?!api/auth|api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
