import TopBar from '@/components/global/TopBar';
import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';

/**
 * Shared wrapper for all inner pages.
 * Renders the sticky header, page content, and footer.
 */
export default function PageLayout({ children }) {
  return (
    <main className="min-h-screen bg-white">
      <header className="fixed w-full top-0 z-50 shadow-sm flex flex-col">
        <TopBar />
        <Navbar />
      </header>
      <div className="pt-[90px] md:pt-[140px]">
        {children}
      </div>
      <Footer />
    </main>
  );
}
