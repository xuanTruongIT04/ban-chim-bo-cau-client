/**
 * Format a VND amount using Vietnamese locale formatting.
 * e.g. 150000 → "150.000 ₫"
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
