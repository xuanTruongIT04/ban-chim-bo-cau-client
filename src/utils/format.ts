const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export function formatVND(amount: number): string {
  return vndFormatter.format(amount);
}

/**
 * Extract image URL from primary_image field.
 * Public API returns a string URL; Admin API may return an object { id, url, is_primary }.
 */
export function extractImageUrl(
  primaryImage: string | { url?: string } | null | undefined,
): string | null {
  if (!primaryImage) return null;
  if (typeof primaryImage === 'string') return primaryImage;
  if (typeof primaryImage === 'object' && primaryImage.url) return primaryImage.url;
  return null;
}
