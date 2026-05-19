import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({ 
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"], 
  variable: "--font-cormorant" 
});

export const metadata: Metadata = {
  title: "Bhima Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
  description: "High-converting luxury jewellery store built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
