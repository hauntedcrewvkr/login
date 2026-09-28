import { NextResponse } from "next/server";
import { sessionService } from "@/features/auth/services/session-service";
import { tokenService } from "@/features/auth/services/token-service";

/**
 * Enterprise Session Revocation Route Handler.
 * Instantly deletes session and token from Redis in-memory store.
 */
export async function POST(request) {
  try {
    let sessionId = null;

    try {
      const body = await request.json();
      sessionId = body.sessionId;
    } catch {
      // Body may be empty
    }

    // If sessionId not in body, attempt to extract from Bearer token
    if (!sessionId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const rawToken = authHeader.substring(7);
        const verification = await tokenService.verifyAccessToken(rawToken);
        if (verification.valid) {
          sessionId = verification.payload.sessionId;
        }
      }
    }

    if (sessionId) {
      await sessionService.revokeSession(sessionId);
    }

    const response = NextResponse.json(
      {
        success: true,
        data: { message: "Session revoked successfully." },
        error: null,
      },
      { status: 200 }
    );

    // Clear refresh cookie
    response.cookies.delete("refreshToken");

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to revoke session.",
      },
      { status: 500 }
    );
  }
}
