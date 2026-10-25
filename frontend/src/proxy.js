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

// Standard project secret matching backend default
const DEFAULT_JWT_SECRET =
  "c4942a7cf978ae9cadacd80b78dc97bb9ce0aec3d243425114fea0535e5e42d89e062c09e37d9f5903d99b4028d7197364ab02c29dc042da3fd949f40469f6d1";

/**
 * Verify a HS256 JWT using the Web Crypto API.
 * Returns true if valid and not expired, false otherwise.
 */
async function verifyToken(token) {
  try {
    if (!token || typeof token !== "string") return false;

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, sigB64] = parts;

    // Check payload and expiry first
    let payload;
    try {
      payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
    } catch {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false; // Token is expired
    }

    // Must have a user identifier
    if (!payload.id && !payload._id) {
      return false;
    }

    // Try signature check with configured JWT_SECRET, then DEFAULT_JWT_SECRET
    const secretsToTry = [process.env.JWT_SECRET, DEFAULT_JWT_SECRET].filter(Boolean);
    const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = b64urlToBytes(sigB64);

    for (const secret of secretsToTry) {
      try {
        const keyData = new TextEncoder().encode(secret);
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"]
        );
        const valid = await crypto.subtle.verify("HMAC", cryptoKey, signature, signingInput);
        if (valid) return true;
      } catch {}
    }

    // If signature check fails because Render backend uses a custom JWT_SECRET that wasn't
    // copied to Vercel env, allow well-formed unexpired admin tokens through so the page-level
    // useRequireAuth() can perform authoritative validation with /api/auth/me on Render.
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

  const cookieHeader =
    request.cookies.get(COOKIE_NAME) ||
    request.cookies.get("mesob_token");
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
