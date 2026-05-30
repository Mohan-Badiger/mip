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

import dbConnect from "@/backend/config/dbConnect";
import Category from "@/backend/models/Category";
import Collection from "@/backend/models/Collection";
import CMS from "@/backend/models/CMS";
import Settings from "@/backend/models/Settings";
import AnnouncementBanner from "@/components/global/AnnouncementBanner";

export const dynamic = "force-dynamic";

const DEFAULT_SECTIONS = [
  { id: "hero", name: "Hero Carousel Slider", type: "Slider", active: true, order: 0 },
  { id: "exquisite", name: "Luxury That Matches Your Style", type: "Grid", active: true, order: 1 },
  { id: "cards", name: "Modern Collections", type: "Grid", active: true, order: 2 },
  { id: "categories", name: "Shop By Category", type: "Grid", active: true, order: 3 },
  { id: "ycollection", name: "Y Collection", type: "Banner", active: true, order: 4 },
  { id: "gender", name: "Shop By Gender", type: "Grid", active: true, order: 5 },
  { id: "plan", name: "MIP My Choice", type: "Banner", active: true, order: 6 },
  { id: "legacy", name: "A Choice You Can Trust", type: "Grid", active: true, order: 7 },
  { id: "newsletter", name: "Join Our MIP Family", type: "Form", active: true, order: 8 }
];

export async function generateMetadata() {
  try {
    await dbConnect();
    const cmsData = await CMS.findOne().lean();
    if (cmsData && cmsData.seo) {
      return {
        title: cmsData.seo.title || "MIP Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
        description: cmsData.seo.description || "Handcrafted Indian luxury gold, diamonds, and silver jewellery since 1925."
      };
    }
  } catch (err) {
    console.error("Failed to generate CMS SEO metadata:", err);
  }
  return {
    title: "MIP Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
    description: "Handcrafted Indian luxury gold, diamonds, and silver jewellery since 1925."
  };
}

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mipjewellers.com";

  let dbCategories = [];
  let dbCollections = [];
  let cmsData = null;
  let settingsData = null;
  try {
    await dbConnect();
    dbCategories = await Category.find({}).lean();
    dbCollections = await Collection.find({}).lean();
    cmsData = await CMS.findOne().lean();
    settingsData = await Settings.findOne().lean();
  } catch (err) {
    console.error("Failed to load categories/collections/CMS/Settings on homepage:", err);
  }
  const serializedCategories = JSON.parse(JSON.stringify(dbCategories));
  const serializedCollections = JSON.parse(JSON.stringify(dbCollections));
  const serializedCms = cmsData ? JSON.parse(JSON.stringify(cmsData)) : null;
  const serializedSettings = settingsData ? JSON.parse(JSON.stringify(settingsData)) : null;
  const hasBanner = serializedSettings && serializedSettings.bannerEnabled && serializedSettings.bannerText;

  const sectionsToRender = (serializedCms && serializedCms.sections && serializedCms.sections.length > 0)
    ? serializedCms.sections.filter(s => s.active).sort((a, b) => a.order - b.order)
    : DEFAULT_SECTIONS.filter(s => s.active);

  // Organization Schema Markup
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MIP Jewellers",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`,
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
        <AnnouncementBanner />
        <TopBar />
        <Navbar />
      </header>
      <div className={hasBanner ? "pt-32.5 md:pt-45" : "pt-22.5 md:pt-35"}>
        {sectionsToRender.map((section) => {
          switch (section.id) {
            case "hero":
              return <HeroCarousel key="hero" slides={serializedCms?.heroSlides} />;
            case "exquisite":
              return <ExquisiteCollections key="exquisite" name={section.name} />;
            case "cards":
              return <CollectionsCards key="cards" collections={serializedCollections} name={section.name} />;
            case "categories":
              return <ShopByCategory key="categories" categories={serializedCategories} name={section.name} />;
            case "ycollection":
              return <YCollection key="ycollection" name={section.name} />;
            case "gender":
              return <ShopByGender key="gender" name={section.name} />;
            case "plan":
              return <PurchasePlanBanner key="plan" name={section.name} />;
            case "legacy":
              return <TrustLegacy key="legacy" name={section.name} />;
            case "newsletter":
              return <Newsletter key="newsletter" name={section.name} />;
            default:
              return null;
          }
        })}
      </div>
      <Footer />
    </main>
  );
}

