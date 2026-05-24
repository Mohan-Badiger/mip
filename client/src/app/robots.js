export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/account/', '/cart/', '/purchase-plan/success'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
