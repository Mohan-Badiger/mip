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
import {
  Loader2,
  Save,
  Settings,
  Mail,
  RefreshCw,
  Server,
  Zap,
  CheckCircle2,
} from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";

export default function WebsiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(""); // Stores active tag being purged
  const [purgeSuccess, setPurgeSuccess] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [settings, setSettings] = useState({
    autoUpdateRates: false,
    showLiveBanner: false,
    autoRecalculatePricing: true,
    goldRateOffset: 0,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    brandName: "MIP Jewellers",
    supportPhone: "+91 9845012345",
    supportEmail: "support@mipjewellers.com"
  });

  async function fetchSettings() {
    try {
      setLoading(true);
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
    e.preventDefault();
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-slate-400 font-sans bg-[#FAF8F5]">
        <JewelryLoader size="md" label="Loading Configuration..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] font-semibold uppercase">
            Website & Shop Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure rates recalculation parameters, email SMTP credentials, and purge cache directories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="flex items-center text-xs font-semibold text-emerald-750 bg-emerald-50 px-3 py-2 rounded border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> {successMsg}
            </span>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] font-sans text-xs uppercase tracking-wider px-6 py-5 shadow-md transition-all"
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
        
        {/* Core parameters & Email */}
        <div className="space-y-6">
          
          {/* Rate recalculation controls */}
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> Rates & Recalculation
              </CardTitle>
              <CardDescription className="text-xs">
                Manage live commodity metal rates and pricing offset parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5 max-w-[80%]">
                  <Label htmlFor="autoUpdateRates" className="text-xs font-bold text-[#1A1A1A]">Live Rates Automation</Label>
                  <p className="text-[10px] text-muted-foreground">Regularly retrieve live market rates for Gold, Platinum, and Silver.</p>
                </div>
                <Switch
                  id="autoUpdateRates"
                  checked={settings.autoUpdateRates}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, autoUpdateRates: val }))}
                />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5 max-w-[80%]">
                  <Label htmlFor="autoRecalculatePricing" className="text-xs font-bold text-[#1A1A1A]">Auto Recalculate Catalog</Label>
                  <p className="text-[10px] text-muted-foreground">Automatically recompute front-end price tags when metal rates alter.</p>
                </div>
                <Switch
                  id="autoRecalculatePricing"
                  checked={settings.autoRecalculatePricing}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, autoRecalculatePricing: val }))}
                />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5 max-w-[80%]">
                  <Label htmlFor="showLiveBanner" className="text-xs font-bold text-[#1A1A1A]">Show Live Rates Banner</Label>
                  <p className="text-[10px] text-muted-foreground">Toggle the marquee gold rate banner on the customer storefront header.</p>
                </div>
                <Switch
                  id="showLiveBanner"
                  checked={settings.showLiveBanner}
                  onCheckedChange={(val) => setSettings(prev => ({ ...prev, showLiveBanner: val }))}
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="goldRateOffset" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Gold Offset (₹ per gram)</Label>
                <Input
                  id="goldRateOffset"
                  type="number"
                  placeholder="e.g. 50"
                  value={settings.goldRateOffset}
                  onChange={(e) => setSettings(prev => ({ ...prev, goldRateOffset: Number(e.target.value) }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Adds or subtracts a premium fee per gram to the live benchmark gold rates.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Transactional Mail SMTP
              </CardTitle>
              <CardDescription className="text-xs">
                SMTP configurations for order confirmations and tracking transit notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              
              <div className="space-y-1">
                <Label htmlFor="smtpHost" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">SMTP Host Server</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  placeholder="e.g. smtp.mailgun.org"
                />
              </div>

              <div className="grid gap-4 grid-cols-3">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="smtpUser" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">SMTP User</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                    placeholder="postmaster@mip.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="smtpPort" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: Number(e.target.value) }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="smtpPass" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">SMTP Secret Password</Label>
                <Input
                  id="smtpPass"
                  type="password"
                  value={settings.smtpPass}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpPass: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  placeholder="••••••••••••••••"
                />
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Cache purging and details */}
        <div className="space-y-6">
          
          {/* Brand Credentials */}
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" /> Store Identity Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Credentials representing your physical/digital brand footprints.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="space-y-1">
                <Label htmlFor="brandName" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Brand Name</Label>
                <Input
                  id="brandName"
                  value={settings.brandName}
                  onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="supportPhone" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="supportEmail" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Support Email</Label>
                  <Input
                    id="supportEmail"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Sync & Cache Invalidation Panel */}
          <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-[#FAF8F5] border-b border-[#DED8D0]/60 pb-3.5">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" /> Front-end Cache Invalidation
              </CardTitle>
              <CardDescription className="text-[10px]">
                Manually invalidate the Next.js static cache of the customer client site to force update catalog prices.
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
                <div className="flex items-center justify-between border border-[#DED8D0] p-4 rounded-lg bg-[#FAF8F5]/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1A1A1A] block">Gold Rates Cache</span>
                    <span className="text-[9px] font-mono text-muted-foreground block">Tag Hook: &ldquo;gold-rates&rdquo;</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurgeCache("gold-rates")}
                    disabled={purging === "gold-rates"}
                    className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-[10px] uppercase tracking-wider h-8 shadow-none"
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
                <div className="flex items-center justify-between border border-[#DED8D0] p-4 rounded-lg bg-[#FAF8F5]/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1A1A1A] block">Homepage CMS Layouts</span>
                    <span className="text-[9px] font-mono text-muted-foreground block">Tag Hook: &ldquo;cms&rdquo;</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurgeCache("cms")}
                    disabled={purging === "cms"}
                    className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-[10px] uppercase tracking-wider h-8 shadow-none"
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
                <div className="flex items-center justify-between border border-[#DED8D0] p-4 rounded-lg bg-[#FAF8F5]/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1A1A1A] block">Products Catalog Detail</span>
                    <span className="text-[9px] font-mono text-muted-foreground block">Tag Hook: &ldquo;products&rdquo;</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePurgeCache("products")}
                    disabled={purging === "products"}
                    className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-[10px] uppercase tracking-wider h-8 shadow-none"
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
