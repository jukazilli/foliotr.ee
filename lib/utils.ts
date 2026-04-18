import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date using Intl.DateTimeFormat in pt-BR locale.
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "year-month" | "year" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "short":
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);

    case "long":
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);

    case "year-month":
      return new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(d);

    case "year":
      return new Intl.DateTimeFormat("pt-BR", {
        year: "numeric",
      }).format(d);

    default:
      return new Intl.DateTimeFormat("pt-BR").format(d);
  }
}

/**
 * Returns the first two initials of a name in uppercase.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Creates a URL-safe slug from a text string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates a text to a maximum length, appending "..." if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Returns a human-readable label for a social/professional platform.
 */
export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    github: "GitHub",
    gitlab: "GitLab",
    linkedin: "LinkedIn",
    twitter: "Twitter/X",
    x: "Twitter/X",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    tiktok: "TikTok",
    twitch: "Twitch",
    discord: "Discord",
    slack: "Slack",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    website: "Website",
    blog: "Blog",
    medium: "Medium",
    devto: "Dev.to",
    hashnode: "Hashnode",
    stackoverflow: "Stack Overflow",
    dribbble: "Dribbble",
    behance: "Behance",
    figma: "Figma",
    producthunt: "Product Hunt",
    npm: "npm",
    pypi: "PyPI",
    docker: "Docker Hub",
    email: "E-mail",
    phone: "Telefone",
    calendly: "Calendly",
    linktree: "Linktree",
    portfolio: "Portfólio",
    cv: "Currículo",
    resume: "Currículo",
    other: "Outro",
  };

  return labels[platform.toLowerCase()] ?? platform;
}

/**
 * Builds a full URL from a platform identifier and a handle or full URL value.
 */
export function getPlatformUrl(platform: string, value: string): string {
  // If already a full URL, return as-is
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const handle = value.replace(/^@/, "");

  const patterns: Record<string, string> = {
    github: `https://github.com/${handle}`,
    gitlab: `https://gitlab.com/${handle}`,
    linkedin: `https://linkedin.com/in/${handle}`,
    twitter: `https://twitter.com/${handle}`,
    x: `https://x.com/${handle}`,
    instagram: `https://instagram.com/${handle}`,
    facebook: `https://facebook.com/${handle}`,
    youtube: `https://youtube.com/@${handle}`,
    tiktok: `https://tiktok.com/@${handle}`,
    twitch: `https://twitch.tv/${handle}`,
    medium: `https://medium.com/@${handle}`,
    devto: `https://dev.to/${handle}`,
    hashnode: `https://${handle}.hashnode.dev`,
    stackoverflow: `https://stackoverflow.com/users/${handle}`,
    dribbble: `https://dribbble.com/${handle}`,
    behance: `https://behance.net/${handle}`,
    npm: `https://www.npmjs.com/~${handle}`,
    producthunt: `https://www.producthunt.com/@${handle}`,
    docker: `https://hub.docker.com/u/${handle}`,
    calendly: `https://calendly.com/${handle}`,
    linktree: `https://linktr.ee/${handle}`,
    telegram: `https://t.me/${handle}`,
    discord: `https://discord.com/users/${handle}`,
  };

  return patterns[platform.toLowerCase()] ?? value;
}
