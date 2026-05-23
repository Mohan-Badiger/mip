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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Save,
  Globe,
  CheckCircle2,
  Eye,
  MessageSquare,
  Search,
  ExternalLink,
} from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";

export default function SeoSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: "luxury jewellery, gold ornaments, bridal gold, diamond rings, platinum jewellery, mip gold",
    socialImage: "/images/social_share_banner.png"
  });

  async function fetchSEO() {
    try {
      setLoading(true);
      const res = await fetch("/api/cms");
      const json = await res.json();
      if (json.success && json.data) {
        setSeo(prev => ({
          ...prev,
          title: json.data.seo?.title || "MIP Jewellers | Premium Gold & Diamond Collections",
          description: json.data.seo?.description || "Discover our exclusive collection of 22K gold, diamond, and platinum jewellery. Shop online or visit our stores."
        }));
      }
    } catch (err) {
      console.error("Failed to load CMS SEO settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSEO();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg("");
      
      // Load current CMS data first to preserve sliders and sections
      const getRes = await fetch("/api/cms");
      const getJson = await getRes.json();
      
      let payload = {};
      if (getJson.success && getJson.data) {
        payload = {
          ...getJson.data,
          seo: {
            title: seo.title,
            description: seo.description
          }
        };
      } else {
        payload = {
          seo: {
            title: seo.title,
            description: seo.description
          }
        };
      }

      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("SEO configurations successfully published!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(json.error || "Failed to update SEO configurations");
      }
    } catch (err) {
      console.error("Failed to save SEO settings:", err);
      alert("Error occurred while saving SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-slate-400 font-sans bg-[#FAF8F5]">
        <JewelryLoader size="md" label="Loading SEO Configuration..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] font-semibold uppercase">
            SEO & Social Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Optimize how search engines index your brand and customize the social media sharing banner previews.
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
                <Save className="mr-2 h-4 w-4 text-primary" /> Save Metadata
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 items-start max-w-7xl">
        
        {/* SEO Meta Forms */}
        <div className="space-y-6">
          <Card className="border-[#DED8D0] bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Metadata Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Configure primary index tags that dictate search engine presence.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="meta-title" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Meta Title Tag</Label>
                  <span className={`text-[10px] font-mono ${seo.title.length > 60 ? "text-rose-500" : "text-emerald-600"}`}>
                    {seo.title.length} / 60 characters
                  </span>
                </div>
                <Input
                  id="meta-title"
                  value={seo.title}
                  onChange={(e) => setSeo(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                  placeholder="e.g. MIP Jewellers | Luxury 22K Gold & Diamond jewellery"
                />
                <p className="text-[10px] text-muted-foreground">
                  The title tag is displayed on search engine result pages and browser tabs. Recommended under 60 chars.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="meta-desc" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Meta Description</Label>
                  <span className={`text-[10px] font-mono ${seo.description.length > 160 ? "text-rose-500" : "text-emerald-600"}`}>
                    {seo.description.length} / 160 characters
                  </span>
                </div>
                <Textarea
                  id="meta-desc"
                  value={seo.description}
                  onChange={(e) => setSeo(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none min-h-[100px] leading-relaxed"
                  placeholder="Summarize your website offerings for search result snippets..."
                />
                <p className="text-[10px] text-muted-foreground">
                  A high-quality summary explaining what the page offers. Best kept between 120 and 160 characters.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meta-keywords" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">SEO Keywords (Comma Separated)</Label>
                <Input
                  id="meta-keywords"
                  value={seo.keywords}
                  onChange={(e) => setSeo(prev => ({ ...prev, keywords: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="social-image" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Social Open Graph (OG) Image URL</Label>
                <Input
                  id="social-image"
                  value={seo.socialImage}
                  onChange={(e) => setSeo(prev => ({ ...prev, socialImage: e.target.value }))}
                  className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Landscape image shown when sharing links on platforms like WhatsApp or Facebook. Ideal ratio 1200x630px.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Real-time Previews */}
        <div className="space-y-6">
          
          {/* Google Search Snippet Preview */}
          <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-[#FAF8F5] border-b border-[#DED8D0]/60 pb-3.5">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#B39254]" /> Google Search Snippet Simulator
              </CardTitle>
              <CardDescription className="text-[10px]">
                Real-time preview of how this website displays in Google search results.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-6 space-y-2">
              <div className="space-y-1">
                {/* Domain breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-[#202124]">
                  <span className="bg-[#f1f3f4] text-[#3c4043] rounded-full px-2 py-0.5 text-[10px] font-semibold">M</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] leading-tight font-sans">MIP Jewellers</span>
                    <span className="text-[10px] text-[#5f6368] leading-none">https://www.mipjewellers.com</span>
                  </div>
                </div>
                {/* Title */}
                <h3 className="text-[19px] text-[#1a0dab] hover:underline cursor-pointer font-sans leading-snug pt-1 font-medium max-w-xl truncate">
                  {seo.title || "MIP Jewellers | Premium Gold & Diamond Collections"}
                </h3>
                {/* Description */}
                <p className="text-[14px] text-[#4d5156] leading-relaxed max-w-xl font-sans font-normal pt-0.5 break-words">
                  {seo.description || "Discover our exclusive collection of 22K gold, diamond, and platinum jewellery. Shop online or visit our stores."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Share Preview */}
          <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-[#FAF8F5] border-b border-[#DED8D0]/60 pb-3.5">
              <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#B39254]" /> Social Media Share Card Simulator
              </CardTitle>
              <CardDescription className="text-[10px]">
                Preview of link attachment appearances on Facebook, iMessage, and WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden max-w-md bg-white shadow-sm">
                
                {/* Mock image placeholder */}
                <div className="relative aspect-[1200/630] bg-[#FAF8F5] border-b border-slate-200 flex flex-col items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#B39254]/10 via-transparent to-transparent" />
                  <Globe className="w-10 h-10 text-[#B39254]/45 mb-2.5" />
                  <span className="font-heading uppercase tracking-widest text-[9px] text-[#B39254] font-bold">MIP Luxury OG Banner</span>
                  <span className="text-[8px] text-muted-foreground font-mono mt-1">{seo.socialImage}</span>
                </div>

                {/* Content details */}
                <div className="p-4 bg-[#f2f3f5] border-t-0 space-y-1 font-sans text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider block">mipjewellers.com</span>
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1">
                    {seo.title || "MIP Jewellers | Premium Gold & Diamond Collections"}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {seo.description || "Discover our exclusive collection of 22K gold, diamond, and platinum jewellery. Shop online or visit our stores."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
