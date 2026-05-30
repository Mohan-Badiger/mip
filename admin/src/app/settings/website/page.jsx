/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Save,
  RefreshCw,
  Zap,
  CheckCircle2,
  Megaphone,
  Percent,
  Truck,
  Building2,
} from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";

export default function WebsiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(""); // Stores active tag being purged
  const [purgeSuccess, setPurgeSuccess] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [settings, setSettings] = useState({
    brandName: "MIP Jewellers",
    supportPhone: "+91 9845012345",
    supportEmail: "support@mipjewellers.com",
    storeAddress: "123 Heritage Boulevard, MG Road, Bengaluru, Karnataka - 560001",
    bannerEnabled: false,
    bannerText: "✨ Grand Festive Sale: Flat 5% Off Making Charges on Diamond & Gold Jewelry! ✨",
    bannerBgColor: "#B45309",
    bannerTextColor: "#FFFFFF",
    gstRate: 3.0,
    makingChargeGstRate: 18.0,
    freeShippingThreshold: 50000,
    shippingCharge: 250,
    insuranceFee: 150,
    codAllowed: true,
    codLimit: 20000,
    codExtraCharge: 100,
    allowReturns: true,
    returnPeriodDays: 7
  });

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(prev => ({
          ...prev,
          ...json.data
        }));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg("");
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("System configuration updated!");
        // Auto trigger revalidate for products/cms to refresh pages on client
        try {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: "cms" })
          });
        } catch (e) {
          console.warn("Auto-revalidation failed", e);
        }
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(json.error || "Failed to update configurations");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Error occurred while saving configurations.");
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeCache = async (tag) => {
    try {
      setPurging(tag);
      setPurgeSuccess("");
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag })
      });
      const json = await res.json();
      if (json.success) {
        setPurgeSuccess(`Purged tag: "${tag}" successfully!`);
        setTimeout(() => setPurgeSuccess(""), 4000);
      } else {
        alert(json.error || "Failed to invalidate cache");
      }
    } catch (err) {
      console.error("Cache purge failed:", err);
      alert("Failed to reach revalidation endpoint.");
    } finally {
      setPurging("");
    }
  };

  const colorPresets = [
    { name: "Luxury Gold", value: "#B45309" },
    { name: "Midnight Charcoal", value: "#1A1A1A" },
    { name: "Royal Emerald", value: "#064E3B" },
    { name: "Classic Crimson", value: "#881337" },
    { name: "Sapphire Navy", value: "#1E3A8A" },
  ];

  const isValidHex = (val) => /^#[0-9A-F]{6}$/i.test(val);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-125 text-slate-400 font-sans bg-bg-cream">
        <JewelryLoader size="md" label="Loading Configuration..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-bg-cream min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-text-dark font-semibold uppercase">
            Website & Shop Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure store profile, active promotional banners, GST taxation rules, shipping logic, and client cache invalidation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> {successMsg}
            </span>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream font-sans text-xs uppercase tracking-wider px-6 py-5 shadow-md transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 text-primary" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 items-start max-w-7xl">
        
        {/* Left Column: Brand & Banner */}
        <div className="space-y-6">
          
          {/* Brand Identity Card */}
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Brand Profile Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure your public brand names, support lines, and showroom addresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="brandName" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Brand Name</Label>
                <Input
                  id="brandName"
                  value={settings.brandName}
                  onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  placeholder="e.g. MIP Jewellers"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="supportPhone" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                    placeholder="e.g. +91 9845012345"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supportEmail" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Support Email</Label>
                  <Input
                    id="supportEmail"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                    placeholder="e.g. support@mipjewellers.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeAddress" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Flagship Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={settings.storeAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none min-h-18.75"
                  placeholder="Enter full showroom address details..."
                />
              </div>

            </CardContent>
          </Card>

          {/* Announcement Banner Card */}
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" /> Promotional Announcement Banner
              </CardTitle>
              <CardDescription className="text-xs">
                Toggle a global ribbon banner shown at the absolute top of the client storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5 max-w-[80%]">
                  <Label htmlFor="bannerEnabled" className="text-xs font-bold text-text-dark">Enable Global Announcement Banner</Label>
                  <p className="text-[10px] text-muted-foreground">Toggle the announcement banner on the storefront header.</p>
                </div>
                <Switch
                  id="bannerEnabled"
                  checked={settings.bannerEnabled}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, bannerEnabled: val }))}
                />
              </div>

              {settings.bannerEnabled && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="bannerText" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Banner Notice Text</Label>
                    <Input
                      id="bannerText"
                      value={settings.bannerText}
                      onChange={(e) => setSettings(prev => ({ ...prev, bannerText: e.target.value }))}
                      className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                      placeholder="e.g. Free shipping on all gold jewelry orders above ₹50,000!"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Banner Style Palette</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, bannerBgColor: preset.value }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-medium transition-all ${
                            settings.bannerBgColor === preset.value
                              ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                              : "border-[#DED8D0] bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                            style={{ backgroundColor: preset.value }}
                          />
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bannerBgColor" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Custom Background (HEX)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bannerBgColor"
                          value={settings.bannerBgColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, bannerBgColor: e.target.value }))}
                          className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none font-mono"
                          placeholder="#B45309"
                        />
                        <input
                          type="color"
                          value={isValidHex(settings.bannerBgColor) ? settings.bannerBgColor : "#b45309"}
                          onChange={(e) => setSettings(prev => ({ ...prev, bannerBgColor: e.target.value }))}
                          className="w-9 h-9 rounded border border-[#DED8D0] shrink-0 cursor-pointer p-0 bg-transparent overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bannerTextColor" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Custom Text Color (HEX)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bannerTextColor"
                          value={settings.bannerTextColor}
                          onChange={(e) => setSettings(prev => ({ ...prev, bannerTextColor: e.target.value }))}
                          className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none font-mono"
                          placeholder="#FFFFFF"
                        />
                        <input
                          type="color"
                          value={isValidHex(settings.bannerTextColor) ? settings.bannerTextColor : "#ffffff"}
                          onChange={(e) => setSettings(prev => ({ ...prev, bannerTextColor: e.target.value }))}
                          className="w-9 h-9 rounded border border-[#DED8D0] shrink-0 cursor-pointer p-0 bg-transparent overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Preview */}
                  <div className="pt-2">
                    <Label className="text-[10px] font-heading tracking-wider uppercase text-slate-700 block mb-1.5">Live Preview</Label>
                    <div 
                      className="p-2.5 rounded-md text-center text-xs font-semibold tracking-wide shadow-inner overflow-hidden transition-all duration-300"
                      style={{ backgroundColor: settings.bannerBgColor, color: settings.bannerTextColor }}
                    >
                      {settings.bannerText || "Banner announcement text..."}
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>

        </div>

        {/* Right Column: Checkout, Policies & Cache */}
        <div className="space-y-6">
          
          {/* Taxation & Checkout Settings */}
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" /> Tax & Financial Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Configure GST taxation rates for jewelry components and order logistics.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="gstRate" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Gold & Metal GST (%)</Label>
                  <Input
                    id="gstRate"
                    type="number"
                    step="0.01"
                    value={settings.gstRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                    placeholder="3.0"
                  />
                  <p className="text-[9px] text-muted-foreground">Standard GST on gold jewelry value is 3.0%.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="makingChargeGstRate" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Making Charges GST (%)</Label>
                  <Input
                    id="makingChargeGstRate"
                    type="number"
                    step="0.01"
                    value={settings.makingChargeGstRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, makingChargeGstRate: Number(e.target.value) }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                    placeholder="18.0"
                  />
                  <p className="text-[9px] text-muted-foreground">GST applied directly to craftsmanship service is 18.0%.</p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Shipping & Payment Policies Card */}
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Shipping, Cash-on-Delivery & Returns
              </CardTitle>
              <CardDescription className="text-xs">
                Manage logistics fees, COD rules, and return policy parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="freeShippingThreshold" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Free Ship Min (₹)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shippingCharge" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Ship Charge (₹)</Label>
                  <Input
                    id="shippingCharge"
                    type="number"
                    value={settings.shippingCharge}
                    onChange={(e) => setSettings(prev => ({ ...prev, shippingCharge: Number(e.target.value) }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insuranceFee" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Transit Insurance (₹)</Label>
                  <Input
                    id="insuranceFee"
                    type="number"
                    value={settings.insuranceFee}
                    onChange={(e) => setSettings(prev => ({ ...prev, insuranceFee: Number(e.target.value) }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  />
                </div>
              </div>

              {/* COD Toggle & Limits */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <Label htmlFor="codAllowed" className="text-xs font-bold text-text-dark">Enable Cash on Delivery (COD)</Label>
                    <p className="text-[10px] text-muted-foreground">Allow customers to choose COD during storefront checkout.</p>
                  </div>
                  <Switch
                    id="codAllowed"
                    checked={settings.codAllowed}
                    onCheckedChange={(val) => setSettings(prev => ({ ...prev, codAllowed: val }))}
                  />
                </div>

                {settings.codAllowed && (
                  <div className="grid gap-4 grid-cols-2 pl-2 border-l-2 border-slate-100">
                    <div className="space-y-1.5">
                      <Label htmlFor="codLimit" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Max COD Limit (₹)</Label>
                      <Input
                        id="codLimit"
                        type="number"
                        value={settings.codLimit}
                        onChange={(e) => setSettings(prev => ({ ...prev, codLimit: Number(e.target.value) }))}
                        className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="codExtraCharge" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">COD Convenience Fee (₹)</Label>
                      <Input
                        id="codExtraCharge"
                        type="number"
                        value={settings.codExtraCharge}
                        onChange={(e) => setSettings(prev => ({ ...prev, codExtraCharge: Number(e.target.value) }))}
                        className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Returns Toggle */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <Label htmlFor="allowReturns" className="text-xs font-bold text-text-dark">Enable Returns & Exchange</Label>
                    <p className="text-[10px] text-muted-foreground">Enable customer return/exchange requests from customer dashboard.</p>
                  </div>
                  <Switch
                    id="allowReturns"
                    checked={settings.allowReturns}
                    onCheckedChange={(val) => setSettings(prev => ({ ...prev, allowReturns: val }))}
                  />
                </div>

                {settings.allowReturns && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-slate-100 max-w-[50%]">
                    <Label htmlFor="returnPeriodDays" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Return Window (Days)</Label>
                    <Input
                      id="returnPeriodDays"
                      type="number"
                      value={settings.returnPeriodDays}
                      onChange={(e) => setSettings(prev => ({ ...prev, returnPeriodDays: Number(e.target.value) }))}
                      className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                    />
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Sync & Cache Invalidation Panel */}
          <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-bg-cream border-b border-[#DED8D0]/60 pb-3.5">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" /> Front-end Cache Invalidation
              </CardTitle>
              <CardDescription className="text-[10px]">
                Manually invalidate the Next.js static cache of the customer client site to force update catalog prices and configs.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {purgeSuccess && (
                <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" /> {purgeSuccess}
                </div>
              )}

              <div className="space-y-3.5">
                
                {/* Gold Rates Sync */}
                <div className="flex items-center justify-between border border-[#DED8D0] p-4 rounded-lg bg-bg-cream/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-text-dark block">Gold Rates Cache</span>
                    <span className="text-[9px] font-mono text-muted-foreground block">Tag Hook: &ldquo;gold-rates&rdquo;</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurgeCache("gold-rates")}
                    disabled={purging === "gold-rates"}
                    className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream text-[10px] uppercase tracking-wider h-8 shadow-none"
                  >
                    {purging === "gold-rates" ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-1 text-white" /> Purging...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 text-primary mr-1" /> Purge Cache
                      </>
                    )}
                  </Button>
                </div>

                {/* Homepage CMS Sync */}
                <div className="flex items-center justify-between border border-[#DED8D0] p-4 rounded-lg bg-bg-cream/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-text-dark block">Homepage & Store Configs</span>
                    <span className="text-[9px] font-mono text-muted-foreground block">Tag Hook: &ldquo;cms&rdquo;</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurgeCache("cms")}
                    disabled={purging === "cms"}
                    className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream text-[10px] uppercase tracking-wider h-8 shadow-none"
                  >
                    {purging === "cms" ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-1 text-white" /> Purging...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 text-primary mr-1" /> Purge Cache
                      </>
                    )}
                  </Button>
                </div>

                {/* Products Catalog Sync */}
                <div className="flex items-center justify-between border border-[#DED8D0] p-4 rounded-lg bg-bg-cream/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-text-dark block">Products Catalog Detail</span>
                    <span className="text-[9px] font-mono text-muted-foreground block">Tag Hook: &ldquo;products&rdquo;</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurgeCache("products")}
                    disabled={purging === "products"}
                    className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream text-[10px] uppercase tracking-wider h-8 shadow-none"
                  >
                    {purging === "products" ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-1 text-white" /> Purging...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 text-primary mr-1" /> Purge Cache
                      </>
                    )}
                  </Button>
                </div>

              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
