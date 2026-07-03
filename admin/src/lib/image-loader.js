/**
 * Custom Next.js Image Loader
 * Optimizes Cloudinary URLs directly on the Cloudinary CDN and serves local WebP images instantly.
 */
export default function imageLoader({ src, width, quality }) {
  if (!src) return '';

  if (src.includes('res.cloudinary.com')) {
    // Cloudinary URL optimization
    // We insert transformations such as f_auto (auto format like WebP/AVIF),
    // q_auto (auto quality), and w_<width> (resized width) right after '/image/upload/'
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

  // Local images or non-Cloudinary images:
  // Return the src with a width parameter to satisfy Next.js validation requirements.
  // Static assets serve the same file regardless of query parameters.
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}w=${width}`;
}
