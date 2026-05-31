"use client";
import TopBar from '@/components/global/TopBar';
import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import AnnouncementBanner from '@/components/global/AnnouncementBanner';
import { useSettings } from '@/context/SettingsContext';

/**
 * Shared wrapper for all inner pages.
 * Renders the sticky header, page content, and footer.
 */
export default function PageLayout({ children }) {
  const { settings } = useSettings();
  const hasBanner = settings.bannerEnabled && settings.bannerText;

  return (
    <main className="min-h-screen bg-white">
      <header className="fixed w-full top-0 z-50 shadow-sm flex flex-col">
        <AnnouncementBanner />
        <TopBar />
        <Navbar />
      </header>
      <div className={hasBanner ? "pt-32.5 md:pt-45" : "pt-22.5 md:pt-35"}>
        {children}
      </div>
      <Footer />
    </main>
  );
}

