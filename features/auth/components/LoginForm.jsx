"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  KeyRound,
  Database,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { useLogin } from "../hooks/use-login";

// Semantic style abstractions to avoid Tailwind JSX soup
const formContainerClasses = "w-full max-w-lg mx-auto";
const brandHeaderClasses = "flex items-center justify-center gap-2 mb-6";
const iconWrapperClasses = "h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white";
const optionsRowClasses = "flex items-center justify-between text-xs text-neutral-400 select-none";
const rememberMeClasses = "flex items-center gap-2 cursor-pointer";
const forgotPasswordClasses = "hover:text-neutral-200 transition-colors duration-150";
const demoCredentialsBoxClasses = "p-3 rounded-lg bg-surface-subtle border border-white/5 text-xs text-neutral-400 flex flex-col gap-1";
const tokenDisplayBoxClasses = "w-full bg-surface-subtle border border-white/5 rounded-lg p-3 flex flex-col gap-1.5 font-mono text-[11px]";
const tokenLabelClasses = "flex items-center justify-between text-neutral-400 font-sans font-medium text-xs";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
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
  } = useLogin();

  // Authenticated state with Double-Token details and Redis telemetry
  if (authState) {
    const { user, accessToken, refreshToken, sessionId } = authState;

    return (
      <div className={formContainerClasses}>
        <div className={brandHeaderClasses}>
          <div className={iconWrapperClasses}>
            <Database className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-neutral-100">
            Redis Double-Token Active
          </span>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <CardTitle>Session Verified</CardTitle>
              </div>
              <Badge variant="success" size="sm">
                <Zap className="h-3 w-3 mr-1 inline" />
                {latencyMs ? `${latencyMs}ms Ultra-Fast` : "Redis In-Memory"}
              </Badge>
            </div>
            <CardDescription>
              Authenticated with short-lived JWT + rotating Redis session storage.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Identity row */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-white/5 text-xs">
              <span className="text-neutral-400">Authenticated User:</span>
              <div className="flex items-center gap-2">
                <span className="text-neutral-200 font-mono font-medium">{user.email}</span>
                <Badge variant="neutral" size="sm">
                  {user.role}
                </Badge>
              </div>
            </div>

            {/* Token 1: Access Token (JWT) */}
            <div className={tokenDisplayBoxClasses}>
              <div className={tokenLabelClasses}>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <KeyRound className="h-3.5 w-3.5 text-neutral-400" />
                  Token 1: Access Token (Short-Lived JWT)
                </span>
                <span className="text-[10px] text-neutral-500">TTL: 15m (Stateless)</span>
              </div>
              <p className="text-neutral-400 truncate select-all">{accessToken}</p>
            </div>

            {/* Token 2: Refresh Token (Redis Opaque) */}
            <div className={tokenDisplayBoxClasses}>
              <div className={tokenLabelClasses}>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Database className="h-3.5 w-3.5 text-emerald-400" />
                  Token 2: Refresh Token (Redis In-Memory Key)
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold">TTL: 7d (Rotating)</span>
              </div>
              <p className="text-emerald-400/90 truncate select-all">{refreshToken}</p>
            </div>

            {/* Session ID in Redis */}
            <div className="text-[11px] text-neutral-500 font-mono flex items-center justify-between px-1">
              <span>Redis Key: auth:session:{sessionId?.substring(0, 16)}...</span>
              <span>Storage: In-Memory O(1)</span>
            </div>

            {rotationStatus && (
              <div className="p-2.5 rounded-lg bg-surface-subtle border border-white/10 text-xs text-neutral-300 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                <span>{rotationStatus}</span>
              </div>
            )}

            {/* Live Interactive Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleRotateTokens}
                title="Atomically issue new tokens and revoke previous refresh token in Redis"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Rotate Tokens
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleLogout}
                title="Zero-Trust immediate invalidation in Redis"
              >
                Revoke Session
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <span className="text-xs text-neutral-500">
              Redis provides atomic token rotation and instant session revocation.
            </span>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Unauthenticated Sign-in View
  return (
    <div className={formContainerClasses}>
      <div className={brandHeaderClasses}>
        <div className={iconWrapperClasses}>
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-neutral-100">
          Enterprise Access
        </span>
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sign In</CardTitle>
            <Badge variant="neutral" size="sm">
              <Zap className="h-3 w-3 mr-1 inline text-amber-400" />
              Redis In-Memory Auth
            </Badge>
          </div>
          <CardDescription>
            High-assurance authentication with Redis Double Tokenization.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin} noValidate>
          <CardContent>
            {generalError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-300">
                {generalError}
              </div>
            )}

            <Input
              id="email"
              name="email"
              type="email"
              label="Corporate Email"
              placeholder="user@enterprise.internal"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              error={fieldErrors.email}
            />

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                error={fieldErrors.password}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-neutral-500 hover:text-neutral-300 transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className={optionsRowClasses}>
              <label className={rememberMeClasses}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="rounded border-white/10 bg-surface accent-white h-3.5 w-3.5 focus:ring-0"
                />
                <span>Remember this device</span>
              </label>
              <a
                href="#forgot-password"
                className={forgotPasswordClasses}
                onClick={(e) => {
                  e.preventDefault();
                  alert("Contact the security operations center to request a password reset.");
                }}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-2"
            >
              Authenticate with Redis
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className={demoCredentialsBoxClasses}>
              <span className="font-semibold text-neutral-300">Demo Access Credentials:</span>
              <div className="font-mono text-[11px] text-neutral-400">
                User: <span className="text-neutral-200">admin@enterprise.internal</span>
              </div>
              <div className="font-mono text-[11px] text-neutral-400">
                Pass: <span className="text-neutral-200">Enterprise@2026</span>
              </div>
            </div>
          </CardContent>
        </form>

        <CardFooter>
          <span className="text-xs text-neutral-500">
            Double Token: Short-Lived JWT (15m) + Redis Rotating Refresh Token (7d).
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
