/**
 * Canonical Site Configuration for wingologic.com
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://wingologic.com";

export const SITE_NAME = "Wingo Logic";

export function getAbsoluteUrl(path: string = ""): string {
  if (!path) return SITE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
