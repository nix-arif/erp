// proxy.ts
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [/^\/$/, /^\/public-page/, /^\/api\/public\/.*/];

// Halaman yang perlu disekat jika user sudah login
const AUTH_PAGES = [
  /^\/login/,
  /^\/signup/,
  /^\/forgot-password/,
  /^\/reset-password/,
];

function matches(pathname: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(pathname));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1️⃣ KRITERIA 2: Benarkan Signout & API Auth
  // Kita "Early Exit" untuk semua laluan API Better-Auth.
  // Ini memastikan proses pemadaman cookie (signout) tidak diganggu logik redirect.
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = await getSessionCookie(request);
  const isAuthPage = matches(pathname, AUTH_PAGES);
  const isPublicPath = matches(pathname, PUBLIC_PATHS);

  // 2️⃣ KRITERIA 1: Halang user yang dah login ke /login atau /signup
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3️⃣ Benarkan akses ke page auth jika belum login
  if (isAuthPage && !sessionCookie) {
    return NextResponse.next();
  }

  // 4️⃣ Benarkan laluan awam (Home, Public API, dsb)
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 5️⃣ PROTECTED ROUTES (Dashboard, dsb)
  // Jika bukan laluan awam/auth dan tiada session, paksa login
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    // Simpan lokasi asal untuk redirect semula selepas login berjaya
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua request kecuali:
     * 1. Fail statik (favicon, images, etc)
     * 2. API public yang tidak memerlukan auth
     */
    "/((?!api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
