import TopBar from "@/components/global/TopBar";
import Navbar from "@/components/global/Navbar";
import HeroCarousel from "@/components/home/HeroCarousel";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import Footer from "@/components/global/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="fixed w-full top-0 z-50 shadow-sm flex flex-col">
        <TopBar />
        <Navbar />
      </header>
      <div className="pt-[140px]">
        <HeroCarousel />
        <CollectionsGrid />
      </div>
      <Footer />
    </main>
  );
}
