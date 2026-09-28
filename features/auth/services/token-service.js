import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "enterprise_super_secure_jwt_secret_key_minimum_32_characters_2026!";
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

// Access Token Lifetime: 15 minutes
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
// Refresh Token Lifetime in Redis: 7 days
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const tokenService = {
  /**
   * Generates a short-lived cryptographic Access Token (JWT).
   * Verified statelessly in-memory by API endpoints.
   *
   * @param {{ userId: string, email: string, role: string, sessionId: string }} claims
   * @returns {Promise<string>}
   */
  async signAccessToken(claims) {
    const jwt = await new SignJWT({
      userId: claims.userId,
      email: claims.email,
      role: claims.role,
      sessionId: claims.sessionId,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
      .setIssuer("enterprise:auth:service")
      .sign(JWT_SECRET_KEY);

    return jwt;
  },

  /**
   * Verifies the authenticity and expiration of an incoming Access Token.
   *
   * @param {string} token - Raw JWT string.
   * @returns {Promise<{ valid: boolean, payload: object | null, error: string | null }>}
   */
  async verifyAccessToken(token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
        issuer: "enterprise:auth:service",
      });

      return {
        valid: true,
        payload,
        error: null,
      };
    } catch (err) {
      return {
        valid: false,
        payload: null,
        error: err.name === "JWTExpired" ? "TOKEN_EXPIRED" : "INVALID_SIGNATURE",
      };
    }
  },

  /**
   * Generates a high-entropy, opaque Refresh Token.
   * @returns {string}
   */
  generateOpaqueRefreshToken() {
    return `rt_${crypto.randomBytes(32).toString("hex")}`;
  },

  /**
   * Generates a unique session identifier.
   * @returns {string}
   */
  generateSessionId() {
    return `sess_${crypto.randomUUID()}`;
  },
};
