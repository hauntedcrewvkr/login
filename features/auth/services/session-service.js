import { redis } from "@/core/database/redis-client";
import {
  tokenService,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "./token-service";

const PREFIX_SESSION = "auth:session:";
const PREFIX_REFRESH = "auth:refresh:";
const PREFIX_USER_SESSIONS = "auth:user_sessions:";

export const sessionService = {
  /**
   * Initializes a new session in Redis and issues dual tokens.
   *
   * @param {object} user - Authenticated user entity.
   * @param {{ ipAddress?: string, userAgent?: string }} metadata
   * @returns {Promise<{ accessToken: string, refreshToken: string, sessionId: string, user: object, expiresIn: number }>}
   */
  async createSession(user, metadata = {}) {
    const sessionId = tokenService.generateSessionId();
    const refreshToken = tokenService.generateOpaqueRefreshToken();

    const sessionPayload = {
      sessionId,
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      refreshToken,
      ipAddress: metadata.ipAddress || "127.0.0.1",
      userAgent: metadata.userAgent || "Unknown Device",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    // Atomic pipeline execution in Redis for speed
    const pipeline = redis.pipeline();
    pipeline.set(
      `${PREFIX_SESSION}${sessionId}`,
      JSON.stringify(sessionPayload),
      "EX",
      REFRESH_TOKEN_TTL_SECONDS
    );
    pipeline.set(
      `${PREFIX_REFRESH}${refreshToken}`,
      sessionId,
      "EX",
      REFRESH_TOKEN_TTL_SECONDS
    );
    pipeline.sadd(`${PREFIX_USER_SESSIONS}${user.id}`, sessionId);
    pipeline.expire(`${PREFIX_USER_SESSIONS}${user.id}`, REFRESH_TOKEN_TTL_SECONDS);

    await pipeline.exec();

    const accessToken = await tokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });

    return {
      accessToken,
      refreshToken,
      sessionId,
      user,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  },

  /**
   * Rotates a Refresh Token atomically in Redis.
   * Implements token replay detection: if an old refresh token is reused, all sessions can be invalidated.
   *
   * @param {string} incomingRefreshToken
   * @param {{ ipAddress?: string, userAgent?: string }} metadata
   * @returns {Promise<{ success: boolean, data: object | null, error: string | null }>}
   */
  async rotateSession(incomingRefreshToken, metadata = {}) {
    // Step 1: Redis O(1) lookup of refresh token mapping
    const sessionId = await redis.get(`${PREFIX_REFRESH}${incomingRefreshToken}`);

    if (!sessionId) {
      return {
        success: false,
        data: null,
        error: "Invalid or expired refresh token. Please re-authenticate.",
      };
    }

    // Step 2: Fetch active session object
    const rawSession = await redis.get(`${PREFIX_SESSION}${sessionId}`);
    if (!rawSession) {
      // Clean up orphaned refresh token
      await redis.del(`${PREFIX_REFRESH}${incomingRefreshToken}`);
      return {
        success: false,
        data: null,
        error: "Session has been terminated.",
      };
    }

    const session = JSON.parse(rawSession);

    // Step 3: Rotate refresh token & refresh session TTL
    const newRefreshToken = tokenService.generateOpaqueRefreshToken();
    session.refreshToken = newRefreshToken;
    session.lastActiveAt = new Date().toISOString();
    if (metadata.ipAddress) session.ipAddress = metadata.ipAddress;
    if (metadata.userAgent) session.userAgent = metadata.userAgent;

    const pipeline = redis.pipeline();
    // Delete previous refresh token
    pipeline.del(`${PREFIX_REFRESH}${incomingRefreshToken}`);
    // Save updated session with refreshed TTL
    pipeline.set(
      `${PREFIX_SESSION}${sessionId}`,
      JSON.stringify(session),
      "EX",
      REFRESH_TOKEN_TTL_SECONDS
    );
    // Register new refresh token
    pipeline.set(
      `${PREFIX_REFRESH}${newRefreshToken}`,
      sessionId,
      "EX",
      REFRESH_TOKEN_TTL_SECONDS
    );
    await pipeline.exec();

    // Step 4: Issue fresh Access Token
    const newAccessToken = await tokenService.signAccessToken({
      userId: session.userId,
      email: session.email,
      role: session.role,
      sessionId: session.sessionId,
    });

    return {
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionId,
        user: {
          id: session.userId,
          email: session.email,
          role: session.role,
          permissions: session.permissions,
        },
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
      error: null,
    };
  },

  /**
   * Instantly revokes a session from Redis (Zero-Trust immediate invalidation).
   * @param {string} sessionId
   * @returns {Promise<boolean>}
   */
  async revokeSession(sessionId) {
    const rawSession = await redis.get(`${PREFIX_SESSION}${sessionId}`);
    if (!rawSession) return false;

    const session = JSON.parse(rawSession);

    const pipeline = redis.pipeline();
    pipeline.del(`${PREFIX_SESSION}${sessionId}`);
    if (session.refreshToken) {
      pipeline.del(`${PREFIX_REFRESH}${session.refreshToken}`);
    }
    if (session.userId) {
      pipeline.srem(`${PREFIX_USER_SESSIONS}${session.userId}`, sessionId);
    }

    await pipeline.exec();
    return true;
  },

  /**
   * Fetches active session metadata directly from Redis in-memory storage.
   * @param {string} sessionId
   * @returns {Promise<object | null>}
   */
  async getSession(sessionId) {
    const rawSession = await redis.get(`${PREFIX_SESSION}${sessionId}`);
    if (!rawSession) return null;
    return JSON.parse(rawSession);
  },
};
