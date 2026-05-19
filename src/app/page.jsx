import TopBar from "@/components/global/TopBar";
import Navbar from "@/components/global/Navbar";
import HeroCarousel from "@/components/home/HeroCarousel";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import Footer from "@/components/global/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <Navbar />
      <HeroCarousel />
      <CollectionsGrid />
      <Footer />
    </main>
  );
}
