import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { OWNER_COOKIE } from "@/lib/owner";

const OWNER_ONLY_PREFIXES = ["/riwayat", "/laporan"];

async function checkOwnerCookie(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(OWNER_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.OWNER_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.owner === true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const needsOwner = OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsOwner) {
    const unlocked = await checkOwnerCookie(request);
    if (!unlocked) {
      const url = request.nextUrl.clone();
      url.pathname = "/owner-login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
