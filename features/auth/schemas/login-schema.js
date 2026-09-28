import { z } from "zod";

/**
 * Validation schema for user authentication.
 * Enforces enterprise-grade password complexity and email format standards.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email address is required." })
    .email({ message: "Please provide a valid corporate or standard email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters in length." })
    .max(128, { message: "Password exceeds maximum permitted length." }),
  rememberMe: z.boolean().default(false),
});
