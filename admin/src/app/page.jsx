"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Coins,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, ratesRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/gold-rates")
        ]);
        
        const statsJson = await statsRes.json();
        const ratesJson = await ratesRes.json();
        
        if (statsJson.success) {
          setData(statsJson.data);
        }
        if (ratesJson.success) {
          setRates(ratesJson.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8 bg-[#FAF8F5]">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-amber-100/50" />
            <Skeleton className="h-4 w-40 bg-amber-100/50" />
          </div>
          <Skeleton className="h-10 w-32 bg-amber-100/50" />
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-[#DED8D0] bg-white">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Card className="col-span-4 border-[#DED8D0] bg-white">
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3 border-[#DED8D0] bg-white">
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { stats, revenueData, conversionData, recentOrders, topCategories } = data || {
    stats: { totalRevenue: "₹0", pendingOrders: 0, visitors: 0, activeProducts: 0 },
    revenueData: [],
    conversionData: [],
    recentOrders: [],
    topCategories: []
  };

  const getRate = (metal, purity) => {
    const rate = rates.find(r => r.metal === metal && r.purity === purity);
    return rate ? `₹${rate.pricePerGram.toLocaleString("en-IN")}/g` : "—";
  };

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-heading uppercase text-primary font-bold">
            The MIP Atelier
          </span>
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] mt-1 font-semibold uppercase">
            Atelier Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time storefront performance, commodity pricing catalog, and customer sales registry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/cms">
            <Button variant="outline" className="border-[#B39254] text-[#B39254] hover:bg-[#B39254]/5 font-sans text-xs uppercase tracking-wider px-5 py-5">
              Customize Home
            </Button>
          </Link>
          <Link href="/products">
            <Button className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] font-sans text-xs uppercase tracking-wider px-5 py-5">
              Manage Catalog
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#DED8D0] bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-heading tracking-[0.15em] text-muted-foreground uppercase">
              Gross Revenue
            </CardTitle>
            <Coins className="h-4 w-4 text-[#B39254]" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-heading text-[#1A1A1A] font-semibold">{stats.totalRevenue}</div>
            <p className="text-[10px] text-emerald-600 flex items-center mt-2 font-sans">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              +15.4% growth since last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-heading tracking-[0.15em] text-muted-foreground uppercase">
              Active Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#B39254]" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-heading text-[#1A1A1A] font-semibold">+{stats.pendingOrders}</div>
            <p className="text-[10px] text-muted-foreground flex items-center mt-2 font-sans">
              Pending shipping dispatch confirmation
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-heading tracking-[0.15em] text-muted-foreground uppercase">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-[#B39254]" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-heading text-[#1A1A1A] font-semibold">{stats.visitors}</div>
            <p className="text-[10px] text-emerald-600 flex items-center mt-2 font-sans">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              +8.2% new customer accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-heading tracking-[0.15em] text-muted-foreground uppercase">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-[#B39254]" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-heading text-[#1A1A1A] font-semibold">{stats.activeProducts}</div>
            <p className="text-[10px] text-muted-foreground flex items-center mt-2 font-sans">
              Live items currently in showroom
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#DED8D0] bg-white shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
          <div>
            <h3 className="font-heading text-lg text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B39254]" /> Live Commodities Exchange
            </h3>
            <p className="text-xs text-muted-foreground">Store pricing calculations dynamically update based on these rates.</p>
          </div>
          <Link href="/gold-rates">
            <Button size="sm" variant="ghost" className="text-xs text-primary hover:text-primary-foreground hover:bg-primary font-sans uppercase tracking-wider">
              Manage Exchange Rates
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-[#FAF8F5] rounded border border-[#DED8D0]/60 text-center">
            <span className="text-[10px] font-heading uppercase text-muted-foreground tracking-wider block">Gold 24K (999)</span>
            <span className="text-lg font-heading text-[#1A1A1A] font-bold block mt-1">{getRate("gold", "24KT")}</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded border border-[#DED8D0]/60 text-center">
            <span className="text-[10px] font-heading uppercase text-muted-foreground tracking-wider block">Gold 22K (916)</span>
            <span className="text-lg font-heading text-[#1A1A1A] font-bold block mt-1">{getRate("gold", "22KT")}</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded border border-[#DED8D0]/60 text-center">
            <span className="text-[10px] font-heading uppercase text-muted-foreground tracking-wider block">Gold 18K (750)</span>
            <span className="text-lg font-heading text-[#1A1A1A] font-bold block mt-1">{getRate("gold", "18KT")}</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded border border-[#DED8D0]/60 text-center">
            <span className="text-[10px] font-heading uppercase text-muted-foreground tracking-wider block">Platinum (950)</span>
            <span className="text-lg font-heading text-[#1A1A1A] font-bold block mt-1">{getRate("platinum", "950PT")}</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded border border-[#DED8D0]/60 text-center col-span-2 md:col-span-1">
            <span className="text-[10px] font-heading uppercase text-muted-foreground tracking-wider block">Silver (999)</span>
            <span className="text-lg font-heading text-[#1A1A1A] font-bold block mt-1">{getRate("silver", "950PT")}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 border-[#DED8D0] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading uppercase text-base text-[#1A1A1A] tracking-wider">Revenue Stream</CardTitle>
            <CardDescription className="text-xs">Monthly showroom and online store gross revenue details.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B39254" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#B39254" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#8a837f"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8a837f"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `₹${(value / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid #DED8D0",
                      backgroundColor: "#FFFFFF",
                      fontFamily: "var(--font-primary)",
                      fontSize: "12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Gross Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#B39254"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGold)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-[#DED8D0] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading uppercase text-base text-[#1A1A1A] tracking-wider">Atelier Traffic</CardTitle>
            <CardDescription className="text-xs">Showroom visitors conversion rate trends this week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversionData}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#8a837f"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8a837f"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid #DED8D0",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#1A1A1A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTraffic)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-[#DED8D0] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
            <div>
              <CardTitle className="font-heading uppercase text-base text-[#1A1A1A] tracking-wider">Recent Invoices</CardTitle>
              <CardDescription className="text-xs">Latest customer purchase receipts.</CardDescription>
            </div>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-xs text-primary font-sans uppercase tracking-wider">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">No orders registered yet.</div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#FAF8F5] transition-all duration-200 border border-transparent hover:border-[#DED8D0]/40">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1A1A1A] font-sans">
                          Order #{order.id}
                        </span>
                        <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                          order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          order.status === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-50 text-slate-655 border border-slate-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {order.customer} • {order.items} items • {order.time}
                      </p>
                    </div>
                    <div className="font-heading text-xs font-bold text-[#1A1A1A]">{order.amount}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
            <div>
              <CardTitle className="font-heading uppercase text-base text-[#1A1A1A] tracking-wider">Top Collections</CardTitle>
              <CardDescription className="text-xs">Showroom catalog category popularity.</CardDescription>
            </div>
            <Link href="/collections">
              <Button variant="ghost" size="sm" className="text-xs text-primary font-sans uppercase tracking-wider">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {topCategories.map((category, i) => (
                <div key={i} className="flex items-center justify-between p-1">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#DED8D0] text-[#B39254] flex items-center justify-center text-xs font-bold font-heading">
                      {i + 1}
                    </div>
                    <div className="ml-4 space-y-0.5">
                      <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider font-heading">
                        {category.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {category.products} items active in category
                      </p>
                    </div>
                  </div>
                  <Link href="/products">
                    <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-[#FAF8F5] text-muted-foreground hover:text-primary">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
