import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optional gate for the registry JSON.
 * Leave REGISTRY_TOKEN unset to serve /r/*.json publicly.
 * When it is set, clients must send `Authorization: Bearer <token>`.
 */
export function proxy(request: NextRequest) {
  const token = process.env.REGISTRY_TOKEN;
  if (!token) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (header === `Bearer ${token}`) return NextResponse.next();

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": "Bearer" },
  });
}

export const config = {
  matcher: "/r/:path*",
};
