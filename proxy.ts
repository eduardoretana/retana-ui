import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gate for the registry JSON under /r/*.
 *
 * Production fails closed: /r/* is 401 unless REGISTRY_PUBLIC=true, or the
 * request carries a bearer token that matches REGISTRY_TOKEN.
 * Development serves /r/* with no token. A configured token is still required
 * when the client sends a request and the token is set.
 */
export function proxy(request: NextRequest) {
  const token = process.env.REGISTRY_TOKEN;
  const presented = bearerToken(request.headers.get("authorization"));

  if (token) {
    if (safeEqual(presented, token)) return NextResponse.next();
    return unauthorized();
  }

  if (!isProduction() || process.env.REGISTRY_PUBLIC === "true") {
    return NextResponse.next();
  }

  return unauthorized();
}

function isProduction() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function bearerToken(header: string | null) {
  const prefix = "Bearer ";
  if (!header?.startsWith(prefix)) return "";
  return header.slice(prefix.length);
}

/** Length check, then XOR every byte. No node:crypto, so it runs on the edge. */
function safeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index++) {
    mismatch |= a[index] ^ b[index];
  }
  return mismatch === 0;
}

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": "Bearer" },
  });
}

export const config = {
  matcher: "/r/:path*",
};
