import type { Metadata } from "next";
import { Work_Sans, Cinzel } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-primary",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-secondary",
});

export const metadata: Metadata = {
  title: "MIP Admin",
  description: "MIP Jewellery Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background font-sans">
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Topbar />
            <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
