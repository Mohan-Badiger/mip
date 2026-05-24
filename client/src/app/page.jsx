import TopBar from "@/components/global/TopBar";
import Navbar from "@/components/global/Navbar";
import HeroCarousel from "@/components/home/HeroCarousel";
import ExquisiteCollections from "@/components/home/ExquisiteCollections";
import CollectionsCards from "@/components/home/CollectionsCards";
import ShopByCategory from "@/components/home/ShopByCategory";
import ShopByGender from "@/components/home/ShopByGender";
import YCollection from "@/components/home/YCollection";
import PurchasePlanBanner from "@/components/home/PurchasePlanBanner";
import TrustLegacy from "@/components/home/TrustLegacy";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/global/Footer";

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mipjewellers.com";

  // Organization Schema Markup
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MIP Jewellers",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`, // placeholder logo path
    "sameAs": [
      "https://www.facebook.com/mipjewellers",
      "https://www.instagram.com/mipjewellers",
    ],
    "foundingDate": "1925",
    "description": "Premium luxury handcrafted BIS Hallmarked gold, diamonds, and silver jewelry since 1925."
  };

  // WebSite Schema Markup with Search Box targets
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MIP Jewellers Online Store",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/collections?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main className="min-h-screen">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <header className="fixed w-full top-0 z-50 shadow-sm flex flex-col">
        <TopBar />
        <Navbar />
      </header>
      <div className="pt-[90px] md:pt-[140px]">
        <HeroCarousel />
        <ExquisiteCollections />
        <CollectionsCards />
        <ShopByCategory />
        <YCollection />
        <ShopByGender />
        <PurchasePlanBanner />
        <TrustLegacy />
        <Newsletter />
      </div>
      <Footer />
    </main>
  );
}

