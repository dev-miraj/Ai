import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50) +
    "-" +
    Date.now()
  )
}

export function extractTitle(content: string): string {
  const words = content.split(" ").slice(0, 6)
  return words.join(" ") + (content.split(" ").length > 6 ? "..." : "")
}
