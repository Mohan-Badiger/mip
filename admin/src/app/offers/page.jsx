"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Gift, Sparkles, Copy, Calendar, BarChart2 } from "lucide-react";

export default function OffersPage() {
  const coupons = [
    { code: "DIWALI20", discount: "20% OFF", type: "Percentage", description: "Diwali festival discount on making charges", active: true, usage: 142, expiry: "2026-11-15" },
    { code: "GOLD500", discount: "₹500 OFF", type: "Flat Rate", description: "Flat cash discount on cart value above ₹25,000", active: true, usage: 89, expiry: "2026-08-30" },
    { code: "BRIDALWELCOME", discount: "Making Charges Free", type: "Special", description: "100% off making charges on bridal collection sets", active: true, usage: 34, expiry: "2026-12-31" },
    { code: "SILVER10", discount: "10% OFF", type: "Percentage", description: "10% off on all silver ornaments", active: false, usage: 201, expiry: "2026-03-10" }
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800 flex items-center gap-2">
            <Gift className="w-8 h-8 text-amber-500" /> Offers & Promotions
          </h2>
          <p className="text-sm text-slate-500">
            Design discount campaigns, configure coupon codes, and track customer redemption levels.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <Card key={c.code} className="overflow-hidden border-slate-100 hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100/50">
              <div className="flex justify-between items-center">
                <Badge variant={c.active ? "default" : "secondary"} className={c.active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500"}>
                  {c.active ? "Active" : "Expired"}
                </Badge>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{c.type}</span>
              </div>
              <CardTitle className="text-2xl font-mono font-bold text-slate-800 tracking-wider flex items-center justify-between mt-2">
                {c.code}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => navigator.clipboard.writeText(c.code)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </CardTitle>
              <CardDescription className="text-sm font-semibold text-indigo-600 mt-1">{c.discount}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs text-slate-500 min-h-[32px]">{c.description}</p>
              
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-50">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Expiry: {c.expiry}</span>
                <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Redemptions: {c.usage}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="flex flex-col items-center justify-center min-h-[200px] border-dashed border-2 border-slate-200 bg-slate-50/30 hover:bg-slate-50/70 cursor-pointer transition-all duration-300">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border">
              <Plus className="w-5 h-5 text-slate-600" />
            </div>
            <span className="font-semibold text-sm text-slate-600">New Campaign Code</span>
            <span className="text-xs text-slate-400">Set percentages, offsets, or freebies</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
