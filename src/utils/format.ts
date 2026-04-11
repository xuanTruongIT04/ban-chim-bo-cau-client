const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function formatVND(amount: number): string {
  return vndFormatter.format(amount);
}

/**
 * Rewrite legacy IP-based storage URLs to the current API domain.
 * Handles cases where Laravel APP_URL is still set to the old IP.
 */
function normalizeImageUrl(url: string): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!apiBase) return url;
  try {
    const apiOrigin = new URL(apiBase).origin; // e.g. https://api.bocautuson.io.vn
    // Replace any http(s)://IP or http(s)://old-domain with the current API origin
    return url.replace(/^https?:\/\/[^/]+/, apiOrigin);
  } catch {
    return url;
  }
}

/**
 * Extract image URL from primary_image field.
 * Public API returns a string URL; Admin API may return an object { id, url, is_primary }.
 */
export function extractImageUrl(
  primaryImage: string | { url?: string } | null | undefined,
): string | null {
  if (!primaryImage) return null;
  if (typeof primaryImage === 'string') return normalizeImageUrl(primaryImage);
  if (typeof primaryImage === 'object' && primaryImage.url) return normalizeImageUrl(primaryImage.url);
  return null;
}
