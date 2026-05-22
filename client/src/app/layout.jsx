
import { Work_Sans, Cinzel } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/global/AuthModal";
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
  title: "MIP Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
  description: "High-converting luxury jewellery store built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} ${cinzel.variable} antialiased font-sans`} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
