"use client";

import { Bell, Search, TrendingUp, LogOut, User, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";

const ROLE_LABELS = {
  admin: "Super Admin",
  "catalog-manager": "Catalog Manager",
  "cms-editor": "CMS Editor",
  "sales-rep": "Sales Rep",
};

export function Topbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("/api/gold-rates");
        const json = await res.json();
        if (json.success && json.data) {
          setRates(json.data);
        }
      } catch (e) {
        console.error("Failed to fetch rates in topbar:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "AD";

  const gold24k = rates.find(r => r.metal === "gold" && r.purity === "24KT")?.pricePerGram;
  const gold22k = rates.find(r => r.metal === "gold" && r.purity === "22KT")?.pricePerGram;
  const silver = rates.find(r => r.metal === "silver")?.pricePerGram;

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-4">
        <form className="relative flex-1 max-w-md hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products, orders..."
            className="w-full bg-background pl-8 shadow-none"
          />
        </form>
      </div>
      <div className="flex items-center gap-4">
        {!loading && (gold24k || gold22k || silver) && (
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-primary/10 text-primary rounded-sm text-xs font-semibold border border-primary/20 tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded mr-1">BENGALURU LIVE</span>
            {gold24k && <span className="border-r border-primary/20 pr-2">24K: ₹{gold24k}/g</span>}
            {gold22k && <span className="border-r border-primary/20 pr-2">22K: ₹{gold22k}/g</span>}
            {silver && <span>SILVER: ₹{silver}/g</span>}
          </div>
        )}
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </Button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-text-dark text-bg-cream flex items-center justify-center text-[11px] font-bold tracking-wider">
              {initials}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs font-semibold text-text-dark leading-tight">
                {user?.name || "Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {ROLE_LABELS[user?.role] || user?.role || "Admin"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#DED8D0] rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 border-b border-[#DED8D0]/60">
                <p className="text-xs font-semibold text-text-dark">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
