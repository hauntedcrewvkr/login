import { NextResponse } from "next/server";
import { tokenService } from "@/features/auth/services/token-service";
import { sessionService } from "@/features/auth/services/session-service";

/**
 * Enterprise Session Inspection Route Handler.
 * Verifies short-lived Access Token statelessly and retrieves session metadata from Redis.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Authorization header missing or malformed.",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verification = await tokenService.verifyAccessToken(token);

    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `Token verification failed: ${verification.error}`,
        },
        { status: 401 }
      );
    }

    const { sessionId, userId, email, role } = verification.payload;

    // Check active session in Redis to ensure it wasn't revoked
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Session has been revoked in Redis.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: userId,
            email,
            role,
            permissions: session.permissions,
          },
          session: {
            sessionId,
            createdAt: session.createdAt,
            lastActiveAt: session.lastActiveAt,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
          },
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to inspect user session.",
      },
      { status: 500 }
    );
  }
}
