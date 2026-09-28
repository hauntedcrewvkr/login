/**
 * Core application metadata and configuration.
 */
export const siteConfig = {
  name: "Enterprise Login Panel",
  description: "Secure, high-assurance authentication portal built with Feature-Sliced Design.",
  version: "1.0.0",
  security: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    sessionTimeoutMinutes: 60,
  },
  links: {
    docs: "/docs",
    support: "mailto:security@enterprise.internal",
  },
};
