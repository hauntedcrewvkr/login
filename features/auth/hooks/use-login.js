"use client";

import { useState } from "react";
import { loginSchema } from "../schemas/login-schema";

/**
 * Enterprise hook managing Redis Double-Token authentication state, token rotation, and latency metrics.
 */
export function useLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Authenticated state with dual tokens
  const [authState, setAuthState] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [rotationStatus, setRotationStatus] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (generalError) {
      setGeneralError("");
    }
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setGeneralError("");
    setFieldErrors({});

    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      const formattedErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await response.json();
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      if (!response.ok || !json.success) {
        setGeneralError(json.error || "Authentication failed.");
        return;
      }

      setAuthState(json.data);
    } catch (err) {
      setGeneralError("Network error. Unable to reach authentication API.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Triggers Redis token rotation via /api/auth/refresh.
   * Atomically issues a new access token and rotating refresh token in Redis.
   */
  const handleRotateTokens = async () => {
    if (!authState?.refreshToken) return;

    setRotationStatus("Rotating in Redis...");
    const startTime = performance.now();

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: authState.refreshToken }),
      });

      const json = await response.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (response.ok && json.success) {
        setAuthState((prev) => ({
          ...prev,
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        }));
        setRotationStatus(`Rotated via Redis in ${elapsed}ms! Old token revoked.`);
      } else {
        setRotationStatus(`Rotation failed: ${json.error}`);
      }
    } catch {
      setRotationStatus("Rotation network request failed.");
    }
  };

  /**
   * Instantly revokes session in Redis.
   */
  const handleLogout = async () => {
    if (authState?.sessionId) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.accessToken}`,
          },
          body: JSON.stringify({ sessionId: authState.sessionId }),
        });
      } catch {
        // Fallback clean
      }
    }

    setAuthState(null);
    setLatencyMs(null);
    setRotationStatus("");
    setFormData({
      email: "",
      password: "",
      rememberMe: false,
    });
  };

  return {
    formData,
    fieldErrors,
    generalError,
    isLoading,
    authState,
    latencyMs,
    rotationStatus,
    handleInputChange,
    handleLogin,
    handleRotateTokens,
    handleLogout,
  };
}
