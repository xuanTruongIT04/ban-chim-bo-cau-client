---
quick_task_id: 260406-fra-fix-product-ui
date: 2026-04-06
status: completed
---

# Quick Task: Fix Product UI

## What Was Done

1. **HomePage — product image clickable**: Wrapped the cover image `div` in `ProductCard.tsx` with a `<Link to={/products/:id}>` so clicking the image navigates to the product detail page.

2. **ProductDetailPage — main image equal height**: Wrapped the `<Image>` in a fixed-height `div` (`height: 320`, `overflow: hidden`) with `objectFit: cover` so all main images display at the same consistent height.

3. **ProductDetailPage — description text**: Reduced font size to `13px`, color to `#888` (gray), set `maxHeight: 120px` with `overflowY: auto` for vertical scroll when description is long.

4. **ProductDetailPage — thumbnails horizontal scroll**: Replaced AntD `<Row>/<Col>` grid with a flex `div` (`flexDirection: row`, `overflowX: auto`, `flexShrink: 0` per item) so all thumbnails stay in one row and scroll horizontally when there are many images.

## Files Changed

- `src/components/customer/ProductCard.tsx`
- `src/pages/customer/ProductDetailPage.tsx`
