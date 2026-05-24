import StoresClient from '@/components/stores/StoresClient';
import PageLayout from '@/components/global/PageLayout';

export const metadata = {
  title: 'Store Locator | MIP Jewellers – Visit Our Showrooms',
  description: 'Find your nearest MIP Jewellers showroom. Visit our Kochi, Trivandrum, or Calicut showrooms to explore our complete Bis 916 hallmarked jewelry range.',
};

export default function StoresPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com';

  // JewelryStore LocalBusiness Schema Markup
  const storesSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "MIP Jewellers Flagship Showroom",
    "image": `${baseUrl}/images/exquisite_model_1779203407757.png`,
    "telephone": "+91-484-2391000",
    "url": `${baseUrl}/stores`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "M.G. Road",
      "addressLocality": "Kochi",
      "addressRegion": "Kerala",
      "postalCode": "682016",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.9723,
      "longitude": 76.2796
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:30",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:30",
        "closes": "18:00"
      }
    ],
    "priceRange": "$$$$"
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storesSchema) }}
      />
      <StoresClient />
    </PageLayout>
  );
}

