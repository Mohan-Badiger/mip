"use client";

import { Bell, Search, TrendingUp, LogOut, User, ChevronDown, Loader2, ArrowRight, ShoppingCart, Package, Users, Gift } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const ROLE_LABELS = {
  admin: "Super Admin",
  "catalog-manager": "Catalog Manager",
  "cms-editor": "CMS Editor",
  "sales-rep": "Sales Rep",
};

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);
  const notifRef = useRef(null);

  // Universal Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], orders: [], customers: [], coupons: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  // Search Refs
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutsideSearch = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  // Gold rates loading
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
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Notifications compilation
  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifs = [];

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

  // Hotkey listener for Ctrl+K / Cmd+K (focus input instead of modal toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query fetcher
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults({ products: [], orders: [], customers: [], coupons: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSearchResults(json.data);
          setSelectedResultIndex(0);
        }
      } catch (err) {
        console.error("Search API error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Flattened items list for universal keyboard/mouse selection (Products, Orders, Customers, Coupons only)
  const flatItems = [];

  if (searchQuery.trim().length >= 2) {
    searchResults.products.forEach(p => {
      flatItems.push({
        type: 'product',
        categoryLabel: 'Products',
        title: p.name,
        subtitle: `SKU: ${p.sku} • Metal: ${p.metalPurity} ${p.metalType} • Stock: ${p.stock} units left`,
        url: `/products?search=${encodeURIComponent(p.sku)}`,
        item: p
      });
    });
    searchResults.orders.forEach(o => {
      flatItems.push({
        type: 'order',
        categoryLabel: 'Orders',
        title: `Order #${o.razorpayOrderId || o._id.slice(-6).toUpperCase()}`,
        subtitle: `Client: ${o.user?.name || 'Guest Customer'} (${o.user?.email || ''}) • Total: ₹${(o.grandTotal || 0).toLocaleString('en-IN')} • Status: ${o.orderStatus}`,
        url: `/orders?search=${encodeURIComponent(o.razorpayOrderId || o._id)}`,
        item: o
      });
    });
    searchResults.customers.forEach(c => {
      flatItems.push({
        type: 'customer',
        categoryLabel: 'Customers',
        title: c.name,
        subtitle: `Email: ${c.email} • Phone: ${c.phone || 'No phone'}`,
        url: `/customers?search=${encodeURIComponent(c.email)}`,
        item: c
      });
    });
    searchResults.coupons.forEach(cp => {
      flatItems.push({
        type: 'coupon',
        categoryLabel: 'Marketing Coupons',
        title: cp.code,
        subtitle: `${cp.discountType.toUpperCase()} Discount • Value: ${cp.discountValue} • Min Cart: ₹${cp.minCartValue || 0}`,
        url: `/offers?search=${encodeURIComponent(cp.code)}`,
        item: cp
      });
    });
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[selectedResultIndex]) {
        const url = flatItems[selectedResultIndex].url;
        setIsSearchOpen(false);
        setSearchQuery("");
        router.push(url);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

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
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <SidebarTrigger />

        {/* Search input attached directly to the Topbar navbar with absolutely positioned dropdown */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg" ref={searchRef}>
          <div className="relative flex items-center bg-muted/40 hover:bg-muted/65 border border-slate-200 rounded-lg transition-all duration-200 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-transparent py-2 pl-9.5 pr-14 text-xs outline-none border-0 text-text-dark font-sans placeholder-slate-400 focus:ring-0 focus:outline-none"
            />
            {searchLoading ? (
              <Loader2 className="animate-spin absolute right-3 h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-5 select-none items-center gap-0.5 rounded border bg-white px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100 uppercase tracking-wider shadow-3xs shrink-0">
                Ctrl+K
              </kbd>
            )}
          </div>

          {/* Autocomplete Dropdown list shown below search bar input */}
          {isSearchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-1.5 max-h-[60vh] overflow-y-auto bg-white border border-slate-200/80 rounded-xl shadow-xl z-9999 p-2 space-y-1">
              {flatItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No matching results found for "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-1.5">
                  {flatItems.map((item, idx) => {
                    const isSelected = idx === selectedResultIndex;
                    const prevItem = idx > 0 ? flatItems[idx - 1] : null;
                    const showCategoryHeader = !prevItem || prevItem.categoryLabel !== item.categoryLabel;

                    return (
                      <div key={idx} className="space-y-1">
                        {showCategoryHeader && (
                          <div className="px-3 pt-3 pb-1.5 first:pt-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold font-heading block">
                              {item.categoryLabel}
                            </span>
                          </div>
                        )}

                        <div
                          onMouseEnter={() => setSelectedResultIndex(idx)}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                            router.push(item.url);
                          }}
                          className={`flex items-center justify-between gap-4 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${isSelected
                              ? "bg-slate-900 text-white shadow-md scale-[1.005]"
                              : "hover:bg-slate-100/80 text-slate-700 bg-white border border-slate-100/50"
                            }`}
                        >
                          {/* Left Side: Icon & Details */}
                          <div className="flex-1 min-w-0 flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-md shrink-0 ${isSelected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-650"
                              }`}>
                              {item.type === 'product' && <Package className="w-3.5 h-3.5" />}
                              {item.type === 'order' && <ShoppingCart className="w-3.5 h-3.5" />}
                              {item.type === 'customer' && <Users className="w-3.5 h-3.5" />}
                              {item.type === 'coupon' && <Gift className="w-3.5 h-3.5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${isSelected ? "text-white" : "text-slate-800"} truncate`}>
                                {item.title}
                              </p>
                              <p className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-white/70" : "text-slate-500"}`}>
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Right Side: Badges & Nav Indicator */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            {item.type === 'product' && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${item.item.stock <= 3
                                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                                  : item.item.isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-250"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}>
                                {item.item.stock <= 3 ? `Low Stock` : item.item.isActive ? "Active" : "Draft"}
                              </span>
                            )}
                            {item.type === 'order' && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${item.item.orderStatus === 'delivered'
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.item.orderStatus === 'cancelled'
                                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                {item.item.orderStatus}
                              </span>
                            )}
                            {item.type === 'customer' && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${item.item.status === 'Suspended'
                                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}>
                                {item.item.status}
                              </span>
                            )}

                            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "translate-x-0.5 text-white" : "text-slate-400"}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right-aligned Profile details */}
      <div className="flex items-center gap-4 shrink-0 font-sans">
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
                          <p className="text-[11px] text-slate-605 leading-relaxed">{item.message}</p>
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

          {/* Dropdown Menu */}
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
