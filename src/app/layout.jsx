
import { Work_Sans, Cinzel } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({ 
  subsets: ["latin"], 
  variable: "--font-work-sans" 
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel"
});

export const metadata = {
  title: "Bhima Jewellers Online | Buy Latest Gold, Diamonds, Silver Jewellery",
  description: "High-converting luxury jewellery store built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} ${cinzel.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
