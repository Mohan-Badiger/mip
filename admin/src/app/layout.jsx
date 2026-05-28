import { Work_Sans } from "next/font/google";
import "./globals.css";
import { AdminShell } from "@/components/admin-shell";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-primary",
});

export const metadata = {
  title: "MIP Admin",
  description: "MIP Jewellery Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background font-sans">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
