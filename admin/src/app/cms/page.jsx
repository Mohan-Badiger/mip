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
import {
  ArrowUp,
  ArrowDown,
  Save,
  Loader2,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Eye,
  Sliders,
  ImageIcon
} from "lucide-react";
import Link from "next/link";
import JewelryLoader from "@/components/jewelry-loader";

export default function CMSPage() {
  const [cmsData, setCmsData] = useState({
    heroSlides: [],
    sections: [],
    seo: { title: "", description: "" }
  });
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function fetchCMS() {
    try {
      setLoading(true);
      const res = await fetch("/api/cms");
      const json = await res.json();
      if (json.success) {
        // Ensure sections are sorted by order
        const sortedSections = [...json.data.sections].sort((a, b) => a.order - b.order);
        setCmsData({
          ...json.data,
          sections: sortedSections
        });
      }
    } catch (err) {
      console.error("Failed to load CMS data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCMS();
  }, []);

  const moveSection = (index, direction) => {
    const newSections = [...cmsData.sections];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // Swap elements
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Re-assign orders
    newSections.forEach((sec, idx) => {
      sec.order = idx;
    });

    setCmsData(prev => ({ ...prev, sections: newSections }));
  };

  const toggleSection = (id) => {
    const newSections = cmsData.sections.map(sec => 
      sec.id === id ? { ...sec, active: !sec.active } : sec
    );
    setCmsData(prev => ({ ...prev, sections: newSections }));
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setSuccessMsg("");
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsData)
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Atelier storefront layout updated live!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(json.error || "Failed to publish layout.");
      }
    } catch (err) {
      console.error("Publish CMS failed:", err);
      alert("Error occurred while saving configurations.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-slate-400 font-sans bg-[#FAF8F5]">
        <JewelryLoader size="md" label="Assembling Canvas..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-heading uppercase text-primary font-bold">
            Storefront Manager
          </span>
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] mt-1 font-semibold uppercase">
            Storefront Designer
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Visually arrange storefront homepage layout blocks, toggle section visibility, and direct navigation paths.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="flex items-center text-xs font-semibold text-emerald-750 bg-emerald-50 px-3 py-2 rounded border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> {successMsg}
            </span>
          )}
          <Button 
            onClick={handlePublish} 
            disabled={publishing} 
            className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] font-sans text-xs uppercase tracking-wider px-6 py-5 shadow-md transition-all"
          >
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> Publishing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 text-primary" /> Publish Design
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Setup Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#DED8D0] bg-white hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Hero Slideshow
            </CardTitle>
            <CardDescription className="text-[11px]">
              Configure scrolling banners, prices, and CTA buttons on client viewport header.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cms/banners">
              <Button size="sm" variant="outline" className="w-full border-primary/20 text-[#B39254] hover:bg-primary/5 text-xs font-sans uppercase tracking-wider">
                Manage Banners
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" /> Section Placements
            </CardTitle>
            <CardDescription className="text-[11px]">
              Configure details, collections layout style, and spotlight product grids.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cms/sections">
              <Button size="sm" variant="outline" className="w-full border-primary/20 text-[#B39254] hover:bg-primary/5 text-xs font-sans uppercase tracking-wider">
                Manage Sections
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" /> Search & Social
            </CardTitle>
            <CardDescription className="text-[11px]">
              Preview and configure title tags, meta search snippets, and social sharing graphics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/seo">
              <Button size="sm" variant="outline" className="w-full border-primary/20 text-[#B39254] hover:bg-primary/5 text-xs font-sans uppercase tracking-wider">
                Manage SEO Binders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Visual Layout Arranger Section */}
      <div className="space-y-6">
        <div className="border-b border-[#DED8D0] pb-3">
          <h3 className="font-heading text-lg text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" /> Visual Designer Canvas
          </h3>
          <p className="text-xs text-muted-foreground">Rearrange structural blocks as they map to the client site viewport.</p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {cmsData.sections.map((section, idx) => {
            // Pick a visual background or representation based on section ID
            let blockVisual = null;
            if (section.id === "hero") {
              blockVisual = (
                <div className="h-16 w-full rounded bg-[#FAF8F5] border border-dashed border-[#DED8D0] flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5 font-bold uppercase tracking-widest">Header</span>
                    <span className="text-xs font-heading uppercase text-muted-foreground">Carousel Banner ({cmsData.heroSlides.length} Active Slides)</span>
                  </div>
                  <Link href="/cms/banners" className="text-[10px] font-sans uppercase tracking-widest text-[#B39254] border-b border-[#B39254] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">Edit Slides</Link>
                </div>
              );
            } else if (section.id === "exquisite" || section.id === "cards" || section.id === "categories") {
              blockVisual = (
                <div className="grid grid-cols-4 gap-2 w-full">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-[#FAF8F5] border border-[#DED8D0]/60 rounded flex items-center justify-center">
                      <span className="text-[9px] font-sans text-muted-foreground uppercase tracking-widest">Card Grid</span>
                    </div>
                  ))}
                </div>
              );
            } else if (section.id === "ycollection" || section.id === "plan") {
              blockVisual = (
                <div className="h-12 w-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded flex items-center justify-center">
                  <span className="text-[9px] font-heading uppercase text-muted-foreground tracking-widest">Promotional Spotlight Wide Banner</span>
                </div>
              );
            } else {
              blockVisual = (
                <div className="h-12 w-full bg-[#FAF8F5] border border-dashed border-[#DED8D0]/60 rounded flex items-center justify-center">
                  <span className="text-[9px] font-sans text-muted-foreground uppercase tracking-widest">Static Block Detail Content</span>
                </div>
              );
            }

            return (
              <Card
                key={section.id}
                className={`border-[#DED8D0] bg-white transition-all duration-300 hover:shadow-md
                  ${section.active ? 'opacity-100' : 'opacity-50 bg-[#FAF8F5]/50 border-dashed'}`}
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#DED8D0] text-[#B39254] flex items-center justify-center text-xs font-bold font-heading">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-heading text-sm text-[#1A1A1A] font-semibold uppercase tracking-wider">
                          {section.name}
                        </h4>
                        <span className="text-[10px] uppercase font-sans tracking-widest text-muted-foreground">
                          Placement Group: {section.type} • ID: {section.id}
                        </span>
                      </div>
                    </div>
                    {/* Block Visual Layout Preview */}
                    {section.active && blockVisual}
                  </div>

                  <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:pl-4 border-slate-100 shrink-0 self-end sm:self-auto justify-end w-full sm:w-auto">
                    {/* Toggle */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toggle-${section.id}`} className="text-[10px] font-heading tracking-wider uppercase text-muted-foreground cursor-pointer">
                        {section.active ? "Visible" : "Hidden"}
                      </Label>
                      <Switch
                        id={`toggle-${section.id}`}
                        checked={section.active}
                        onCheckedChange={() => toggleSection(section.id)}
                      />
                    </div>

                    {/* Sorting Arrows */}
                    <div className="flex items-center gap-1 border-l pl-3 border-slate-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 hover:bg-[#FAF8F5] text-muted-foreground hover:text-primary disabled:opacity-20"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, -1)}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 hover:bg-[#FAF8F5] text-muted-foreground hover:text-primary disabled:opacity-20"
                        disabled={idx === cmsData.sections.length - 1}
                        onClick={() => moveSection(idx, 1)}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
