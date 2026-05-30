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

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
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

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifs = [];
        
        // 1. Fetch recent orders
        const ordersRes = await fetch("/api/orders");
        const ordersJson = await ordersRes.json();
        if (ordersJson.success && Array.isArray(ordersJson.data)) {
          const activeOrders = ordersJson.data.slice(0, 3);
          activeOrders.forEach(order => {
            notifs.push({
              id: `order-${order._id}`,
              type: "order",
              title: "New Order Received",
              message: `Order #${order.razorpayOrderId || order._id.slice(-6)} placed by ${order.user?.name || "Customer"} for ₹${(order.grandTotal || 0).toLocaleString('en-IN')}`,
              time: new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              href: `/orders`
            });
          });
        }

        // 2. Fetch products for low stock
        const productsRes = await fetch("/api/products");
        const productsJson = await productsRes.json();
        if (productsJson.success && Array.isArray(productsJson.data)) {
          const lowStockProds = productsJson.data.filter(p => p.stock <= 3 && p.isActive).slice(0, 3);
          lowStockProds.forEach(prod => {
            notifs.push({
              id: `stock-${prod._id}`,
              type: "stock",
              title: "Low Stock Alert",
              message: `"${prod.name}" is running low! Only ${prod.stock} left in inventory.`,
              time: "System Sync",
              href: `/products`
            });
          });
        }

        setNotifications(notifs);
        if (notifs.length === 0) {
          setHasUnread(false);
        }
      } catch (err) {
        console.error("Failed to compile admin notifications:", err);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 2 * 60 * 1000);
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
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <Button 
            variant="outline" 
            size="icon" 
            className="relative cursor-pointer"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setHasUnread(false);
            }}
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#DED8D0] rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 border-b border-[#DED8D0]/60 flex items-center justify-between">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-text-dark">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      setNotifications([]);
                      setHasUnread(false);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-rose-600 transition-colors uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#DED8D0]/40">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No new alerts or notifications.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <a 
                      key={item.id} 
                      href={item.href}
                      onClick={() => setNotifOpen(false)}
                      className="block p-3.5 hover:bg-bg-cream/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.type === 'order' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-text-dark">{item.title}</p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{item.message}</p>
                          <p className="text-[9px] text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
