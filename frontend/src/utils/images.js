/**
 * Responsive product image helpers.
 *
 * Thumbnails on disk are named like `front@480w.jpg` (extension included).
 * Production previously built srcset as `front@480w` (no extension) → 404,
 * so listing cards rendered as empty white boxes with alt text on top.
 */

const VARIANT_WIDTHS = [480, 960, 1600];

export function isRasterImageUrl(url) {
  return typeof url === 'string' && /\.(jpe?g|png|webp)(\?|#|$)/i.test(url);
}

function stripQuery(url) {
  return url.split(/[?#]/)[0];
}

/**
 * Build a valid srcSet. Variants keep the original extension:
 * `/products/foo/front.jpg` → `front@480w.jpg 480w, front@960w.jpg 960w, ...`
 *
 * Only real on-disk variants are advertised. The generated `@1600w` file is
 * capped at the source resolution (~1364px), so we never append a fabricated
 * `2400w` descriptor for the original — lying about width makes the browser
 * believe a sharper asset exists and stop trying to fetch one.
 */
export function buildSrcSet(url) {
  if (!isRasterImageUrl(url)) return undefined;
  const clean = stripQuery(url);
  if (/@\d+w\.(jpe?g|png|webp)$/i.test(clean)) return undefined;

  const match = clean.match(/^(.*)\.(jpe?g|png|webp)$/i);
  if (!match) return undefined;

  const [, base, ext] = match;
  const variantExt = ext.toLowerCase() === 'jpeg' ? 'jpg' : ext;
  return VARIANT_WIDTHS.map((w) => `${base}@${w}w.${variantExt} ${w}w`).join(', ');
}

/** 4 → 3 → 2 column product grid (see `.products-grid` in index.css) */
export const PRODUCT_CARD_SIZES =
  '(max-width: 480px) 50vw, (max-width: 860px) 50vw, (max-width: 1200px) 33vw, 25vw';

export const PDP_MAIN_SIZES =
  '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px';

export const COLLECTION_SIZES =
  '(max-width: 768px) 100vw, 50vw';

export const CATEGORY_TILE_SIZES =
  '(max-width: 768px) 50vw, 20vw';

export const CART_THUMB_SIZES = '80px';

/**
 * If a srcset candidate 404s, drop srcset and reload the original `src`.
 * Re-assigning src is required: browsers keep the broken currentSrc otherwise.
 */
export function handleImageError(event, fallbackUrl) {
  const img = event.currentTarget;
  if (!img || img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';

  const original = fallbackUrl || img.getAttribute('src');
  img.removeAttribute('srcset');
  img.srcSet = '';
  img.removeAttribute('sizes');
  if (!original) return;

  const absolute = (() => {
    try {
      return new URL(original, window.location.origin).href;
    } catch {
      return original;
    }
  })();

  if (img.src === absolute) {
    img.src = '';
  }
  img.src = original;
}
