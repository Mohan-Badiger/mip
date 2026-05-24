import { Work_Sans, Cinzel } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import GoogleAnalytics from "@/components/global/GoogleAnalytics";
import ClientAuthModal from "@/components/global/ClientAuthModal";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-primary"
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-secondary"
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mipjewellers.com"),
  title: "MIP Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
  description: "Handcrafted Indian luxury gold, diamonds, and silver jewellery since 1925. Shop BIS 916 hallmarked earrings, bangles, and necklaces online.",
  keywords: ["gold jewellery", "diamond rings", "silver necklaces", "BIS hallmarked gold", "Indian jewellery online", "MIP Jewellers"],
  openGraph: {
    title: "MIP Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
    description: "Handcrafted Indian luxury gold, diamonds, and silver jewellery since 1925. Shop BIS 916 hallmarked earrings, bangles, and necklaces online.",
    url: "https://mipjewellers.com",
    siteName: "MIP Jewellers",
    images: [
      {
        url: "/images/hero_slide_1.png",
        width: 1200,
        height: 630,
        alt: "MIP Jewellers Heritage Collection",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIP Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
    description: "Handcrafted Indian luxury gold, diamonds, and silver jewellery since 1925.",
    images: ["/images/hero_slide_1.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} ${cinzel.variable} antialiased font-primary`} suppressHydrationWarning>
        <GoogleAnalytics />
        <AuthProvider>
          <CartProvider>
            {children}
            <ClientAuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
