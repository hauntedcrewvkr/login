import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind conflict resolution.
 * @param {...any} inputs - Class names or conditional expressions.
 * @returns {string} - Merged classes.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
