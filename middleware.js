import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const key = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me"
  );

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("wm_session")?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, key());
      valid = true;
    } catch {}
  }

  if (pathname.startsWith("/dashboard") && !valid)
    return NextResponse.redirect(new URL("/login", req.url));
  if (AUTH_PAGES.includes(pathname) && valid)
    return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/forgot-password"],
};
