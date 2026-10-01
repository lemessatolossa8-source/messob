/**
 * JWT authentication helper for Next.js API route handlers.
 * Uses Node.js built-in `crypto` — no extra dependency needed.
 * Verifies HS256 JWTs signed by the Express backend (jsonwebtoken compatible).
 */
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Base64url decode (handles padding).
 */
function b64urlDecode(str) {
  // Convert base64url to base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

/**
 * Verify a HS256 JWT using JWT_SECRET from the environment.
 * Returns the decoded payload or throws an error.
 */
function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");

  const [headerB64, payloadB64, sigB64] = parts;

  // Verify signature
  const signingInput = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSig))) {
    throw new Error("Invalid signature");
  }

  // Decode payload
  const payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8"));

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token has expired");
  }

  return payload;
}

/**
 * Verify the Authorization: Bearer <token> header in a Next.js Request.
 * Returns { ok: true, payload } or { ok: false, response: NextResponse }.
 */
export async function verifyApiAuth(request) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Not authorized – no token provided" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyJwt(token);
    return { ok: true, payload };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Not authorized – invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}
