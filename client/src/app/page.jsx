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
  return (
    <main className="min-h-screen">
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
