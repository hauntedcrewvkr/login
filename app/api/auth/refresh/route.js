import { NextResponse } from "next/server";
import { sessionService } from "@/features/auth/services/session-service";

/**
 * Enterprise Double-Token Rotation Route Handler.
 * Rotates the refresh token in Redis and issues a fresh Access Token.
 */
export async function POST(request) {
  try {
    let incomingRefreshToken = null;

    try {
      const body = await request.json();
      incomingRefreshToken = body.refreshToken;
    } catch {
      // Body may be empty if token is passed strictly via cookie
    }

    if (!incomingRefreshToken) {
      incomingRefreshToken = request.cookies.get("refreshToken")?.value;
    }

    if (!incomingRefreshToken) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Missing refresh token. Authentication required.",
        },
        { status: 401 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown Client";

    const result = await sessionService.rotateSession(incomingRefreshToken, {
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      const errorResponse = NextResponse.json(result, { status: 401 });
      // Clear invalid cookie
      errorResponse.cookies.delete("refreshToken");
      return errorResponse;
    }

    const response = NextResponse.json(result, { status: 200 });

    // Update HttpOnly cookie with newly rotated token
    response.cookies.set("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to rotate authentication tokens.",
      },
      { status: 500 }
    );
  }
}
