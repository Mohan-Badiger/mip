/**
 * Dynamic Image Prefetching Utility
 * Helps preload images in the browser cache on-demand (e.g. on hover).
 */

/**
 * Resolves the optimized URL for a given image, matching the global image loader logic.
 */
export function getOptimizedImageUrl(src, width = 800, quality = 82) {
  if (!src) return '';
  
  if (src.includes('res.cloudinary.com')) {
    const params = [
      'f_auto',
      'q_auto',
      `w_${width}`
    ];
    if (quality) {
      params.push(`q_${quality}`);
    }
    const paramsString = params.join(',');

    if (src.includes('/image/upload/')) {
      return src.replace('/image/upload/', `/image/upload/${paramsString}/`);
    }
  }

  return src;
}

/**
 * Preloads an image into the browser cache.
 */
export function preloadProductImage(src, width = 800) {
  if (typeof window === 'undefined' || !src) return;

  const optimizedUrl = getOptimizedImageUrl(src, width);

  // Maintain a global set of preloaded URLs to avoid duplicate network requests
  if (!window._preloadedImages) {
    window._preloadedImages = new Set();
  }

  if (window._preloadedImages.has(optimizedUrl)) {
    return;
  }

  window._preloadedImages.add(optimizedUrl);

  const img = new window.Image();
  img.src = optimizedUrl;
}
