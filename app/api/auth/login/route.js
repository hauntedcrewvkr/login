import { NextResponse } from "next/server";
import { authService } from "@/features/auth/services/auth-service";

/**
 * Enterprise Double-Token Login Route Handler.
 * Authenticates user, creates in-memory Redis session, and issues tokens.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown Client";

    const result = await authService.login(body, { ipAddress, userAgent });

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json(result, { status: 200 });

    // Store Refresh Token in secure HttpOnly cookie
    response.cookies.set("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal server error during authentication.",
      },
      { status: 500 }
    );
  }
}
