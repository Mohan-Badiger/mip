"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, User, Menu, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function AdminNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "DASHBOARD", href: "/" },
    { label: "PRODUCTS", href: "/products" },
    { label: "ORDERS", href: "/orders" },
    { label: "CUSTOMERS", href: "/customers" },
    { label: "COLLECTIONS", href: "/collections" },
    { label: "CMS", href: "/cms" },
  ];

  return (
    <>
      <nav className="w-full bg-background py-3 md:py-4 sticky top-0 z-50 shadow-sm border-b border-border/40">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          {/* ── Top Row ── */}
          <div className="flex justify-between items-center pb-3 md:pb-4 border-b border-border/40">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden flex items-center justify-center text-foreground"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/">
                <h1 className="font-heading text-xl md:text-2xl tracking-[0.2em] text-secondary-foreground font-bold">
                  Mip Admin
                </h1>
              </Link>
            </div>

            {/* Center: Search bar (desktop only) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <input
                type="text"
                placeholder="Search orders, products, customers..."
                className="w-full py-2 px-4 rounded-full border border-border bg-transparent text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder-muted-foreground"
              />

              <Search className="absolute right-3 top-2 w-5 h-5 text-muted-foreground" />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 md:gap-6 text-sm font-medium text-foreground">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-sm text-xs font-medium border border-primary/20 tracking-widest">
                <span>22K GOLD: ₹6,500/g</span>
              </div>

              <div className="flex gap-3 md:gap-4 items-center border-l border-border pl-3 md:pl-4">
                <Search className="md:hidden w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
                <div className="relative">
                  <Bell className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </div>
                <Settings className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
                <User className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>
          </div>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex justify-center gap-8 pt-4 text-[11px] tracking-[0.2em] font-medium text-secondary-foreground">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "relative group overflow-hidden",
                    isActive ? "text-primary" : "",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-full h-px bg-primary transform origin-center transition-transform duration-300",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-100 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
              className="absolute left-0 top-0 bottom-0 w-[80vw] max-w-[320px] bg-background flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
                <span className="font-heading text-xl tracking-[0.2em] lowercase text-secondary-foreground font-bold">
                  mip admin
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center text-foreground hover:text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 border-b border-border/50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full py-2.5 px-4 rounded-full border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder-muted-foreground"
                  />

                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-2">
                <ul>
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "flex items-center py-3.5 text-[12px] tracking-[0.18em] font-medium border-b border-border/50 transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-secondary-foreground hover:text-primary",
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
