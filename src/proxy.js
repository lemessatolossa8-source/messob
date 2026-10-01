/**
 * Next.js Route Guard (proxy) — protects all /admin/dashboard routes.
 *
 * Reads the `mesob_session` cookie (set by authService on login) and verifies
 * the JWT signature using the JWT_SECRET env var. Unauthenticated requests are
 * redirected to /admin/login.
 *
 * Renamed from middleware.js → proxy.js for Next.js 16+ compatibility.
 * The Web Crypto API (SubtleCrypto) is available in both Edge and Node.js runtimes.
 */

import { NextResponse } from "next/server";

const COOKIE_NAME = "mesob_session";

/**
 * Decode a base64url string to a Uint8Array.
 */
function b64urlToBytes(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Verify a HS256 JWT using the Web Crypto API.
 * Returns true if valid and not expired, false otherwise.
 */
async function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, sigB64] = parts;

    // Import the secret key
    const keyData = new TextEncoder().encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify signature
    const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = b64urlToBytes(sigB64);
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, signature, signingInput);
    if (!valid) return false;

    // Check expiry
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;

    return true;
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Only guard the dashboard — allow the login page through
  if (!pathname.startsWith("/admin/dashboard")) {
    return NextResponse.next();
  }

  const cookieHeader = request.cookies.get(COOKIE_NAME);
  const token = cookieHeader?.value ? decodeURIComponent(cookieHeader.value) : null;

  if (!token || !(await verifyToken(token))) {
    const loginUrl = new URL("/admin/login", request.url);
    // Pass the originally requested URL so login can redirect back after auth
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
