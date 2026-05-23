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
  ImageIcon,
  Plus,
  Save,
  Trash2,
  Edit2,
  Loader2,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import JewelryLoader from "@/components/jewelry-loader";

export default function BannersPage() {
  const [cmsData, setCmsData] = useState({
    heroSlides: [],
    sections: [],
    seo: { title: "", description: "" }
  });
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Slide dialog state
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null); // null means creating
  const [slideFormData, setSlideFormData] = useState({
    image: "",
    tag: "",
    collectionName: "",
    title: "",
    price: "",
    cta: "Explore Collection",
    href: "/collections",
    textSide: "left",
    tagColor: "text-brand-gold",
    textColor: "text-[#1A1A1A]",
    subtitleColor: "text-[#1A1A1A]/70",
    overlay: "bg-gradient-to-r from-white/60 via-white/10 to-transparent"
  });

  // Miniature preview active slide index
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  async function fetchCMS() {
    try {
      setLoading(true);
      const res = await fetch("/api/cms");
      const json = await res.json();
      if (json.success) {
        setCmsData(json.data);
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

  const openAddSlide = () => {
    setEditingSlideIndex(null);
    setSlideFormData({
      image: "",
      tag: "New Arrival",
      collectionName: "Imperial Gold",
      title: "Handcrafted ornaments for modern nobility.",
      price: "",
      cta: "Explore Collection",
      href: "/collections",
      textSide: "left",
      tagColor: "text-brand-gold",
      textColor: "text-[#1A1A1A]",
      subtitleColor: "text-[#1A1A1A]/70",
      overlay: "bg-gradient-to-r from-white/60 via-white/10 to-transparent"
    });
    setIsSlideModalOpen(true);
  };

  const openEditSlide = (index) => {
    setEditingSlideIndex(index);
    const slide = cmsData.heroSlides[index];
    setSlideFormData({
      image: slide.image || "",
      tag: slide.tag || "",
      collectionName: slide.collectionName || "",
      title: slide.title || "",
      price: slide.price || "",
      cta: slide.cta || "Explore Collection",
      href: slide.href || "/collections",
      textSide: slide.textSide || "left",
      tagColor: slide.tagColor || "text-brand-gold",
      textColor: slide.textColor || "text-[#1A1A1A]",
      subtitleColor: slide.subtitleColor || "text-[#1A1A1A]/70",
      overlay: slide.overlay || "bg-gradient-to-r from-white/60 via-white/10 to-transparent"
    });
    setIsSlideModalOpen(true);
  };

  const handleDeleteSlide = (index) => {
    if (!confirm("Are you sure you want to delete this hero slide banner?")) return;
    const newSlides = cmsData.heroSlides.filter((_, idx) => idx !== index);
    const updatedData = { ...cmsData, heroSlides: newSlides };
    setCmsData(updatedData);
    if (previewSlideIdx >= newSlides.length && newSlides.length > 0) {
      setPreviewSlideIdx(newSlides.length - 1);
    }
  };

  const moveSlide = (index, direction) => {
    const newSlides = [...cmsData.heroSlides];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

    setCmsData(prev => ({ ...prev, heroSlides: newSlides }));
    setPreviewSlideIdx(targetIdx);
  };

  const handleSaveSlide = (e) => {
    e.preventDefault();
    if (!slideFormData.image || !slideFormData.collectionName) {
      alert("Cover image and collection headline are required fields.");
      return;
    }

    const newSlides = [...cmsData.heroSlides];
    if (editingSlideIndex !== null) {
      newSlides[editingSlideIndex] = slideFormData;
    } else {
      newSlides.push(slideFormData);
    }

    setCmsData(prev => ({ ...prev, heroSlides: newSlides }));
    setIsSlideModalOpen(false);
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
        setSuccessMsg("Hero carousel banners published successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(json.error || "Failed to publish banners.");
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
        <JewelryLoader size="md" label="Assembling Banners Panel..." />
      </div>
    );
  }

  const activeSlidesCount = cmsData.heroSlides.length;
  const currentPreviewSlide = cmsData.heroSlides[previewSlideIdx];

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <Link href="/cms" className="text-xs uppercase tracking-widest text-[#B39254] hover:text-[#1A1A1A] flex items-center gap-1.5 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront Designer
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] mt-2 font-semibold uppercase">
            Hero Carousel Banners
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure primary advertising slide banners, collection launch graphic assets, and redirect CTA targets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded border border-emerald-200">
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
                <Save className="mr-2 h-4 w-4 text-primary" /> Save & Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Slide Carousel Live Preview Simulator */}
      {activeSlidesCount > 0 && currentPreviewSlide && (
        <Card className="border-[#DED8D0] shadow-sm overflow-hidden bg-slate-950 text-white rounded-lg">
          <div className="bg-[#1A1A1A] border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
            <span className="text-[10px] font-heading tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Live Carousel Simulator
            </span>
            <span className="text-[10px] font-sans font-semibold bg-slate-800 text-slate-350 px-2.5 py-0.5 rounded border border-slate-700 uppercase tracking-wider">
              Slide {previewSlideIdx + 1} of {activeSlidesCount}
            </span>
          </div>
          <div className="relative h-[300px] md:h-[380px] bg-slate-900 flex items-center">
            {currentPreviewSlide.image ? (
              <img
                src={currentPreviewSlide.image}
                alt={currentPreviewSlide.collectionName}
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-300"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-slate-600" />
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className={`absolute inset-0 ${currentPreviewSlide.overlay || "bg-gradient-to-r from-black/55 to-transparent"}`} />

            {/* Slider Text Elements */}
            <div className="absolute inset-0 flex items-center px-8 md:px-20 z-10">
              <div className={`max-w-[80%] md:max-w-[50%] flex flex-col gap-2 md:gap-3
                ${currentPreviewSlide.textSide === 'right' ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'}`}>
                <span className="text-[10px] tracking-[0.25em] font-heading font-semibold text-primary uppercase">
                  {currentPreviewSlide.tag}
                </span>
                <h3 className="font-heading text-2xl md:text-4xl font-bold uppercase tracking-wider text-white leading-tight">
                  {currentPreviewSlide.collectionName}
                </h3>
                <p className="text-xs md:text-sm text-slate-200 max-w-sm line-clamp-3 font-sans leading-relaxed">
                  {currentPreviewSlide.title}
                </p>
                {currentPreviewSlide.price && (
                  <p className="text-xs font-bold text-primary font-sans tracking-wide">
                    {currentPreviewSlide.price}
                  </p>
                )}
                <span className="mt-2 text-[10px] font-heading font-bold uppercase tracking-widest border-b-2 border-primary pb-1 text-white hover:text-primary transition-colors cursor-pointer">
                  {currentPreviewSlide.cta}
                </span>
              </div>
            </div>

            {/* Simulator Navigation Buttons */}
            <button
              onClick={() => setPreviewSlideIdx(prev => (prev - 1 + activeSlidesCount) % activeSlidesCount)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setPreviewSlideIdx(prev => (prev + 1) % activeSlidesCount)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </Card>
      )}

      {/* Slider Management Control Panel */}
      <Card className="border-[#DED8D0] bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <CardTitle className="text-[#1A1A1A] font-heading text-lg uppercase tracking-wider">
              Slide Banners Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Upload background imagery, assign promotional collection titles, and align CTAs.
            </CardDescription>
          </div>
          <Button onClick={openAddSlide} className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-xs font-sans uppercase tracking-wider px-4 py-4">
            <Plus className="mr-1.5 h-4 w-4 text-primary" /> Add Carousel Banner
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {cmsData.heroSlides.length === 0 ? (
            <div className="text-center py-20 text-slate-400 border border-dashed border-[#DED8D0] rounded-lg bg-[#FAF8F5]/30">
              <ImageIcon className="w-12 h-12 text-[#DED8D0] mx-auto mb-3" />
              <p className="text-sm font-semibold uppercase tracking-widest font-heading text-[#1A1A1A]">No banners active</p>
              <p className="text-xs mt-1">Configure slide banners to showcase new collection launches.</p>
            </div>
          ) : (
            cmsData.heroSlides.map((slide, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between border border-[#DED8D0]/60 rounded-lg p-5 bg-white hover:shadow-sm transition-all duration-200 gap-4">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-28 h-16 rounded bg-[#FAF8F5] border border-[#DED8D0] overflow-hidden flex items-center justify-center flex-shrink-0">
                    {slide.image ? (
                      <img src={slide.image} alt={slide.collectionName} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded font-bold font-sans tracking-widest uppercase">
                      Slide #{idx + 1}
                    </span>
                    <h4 className="font-bold text-[#1A1A1A] font-heading tracking-wider text-sm uppercase">
                      {slide.collectionName}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">{slide.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  {/* Sorting Controls */}
                  <div className="flex items-center gap-1 border-r pr-2 border-slate-100 mr-2">
                    <Button
                      onClick={() => moveSlide(idx, -1)}
                      disabled={idx === 0}
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-primary disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => moveSlide(idx, 1)}
                      disabled={idx === cmsData.heroSlides.length - 1}
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-primary disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => setPreviewSlideIdx(idx)}
                    variant="outline"
                    size="sm"
                    className={`text-[10px] font-sans uppercase tracking-wider ${previewSlideIdx === idx ? 'border-primary bg-primary/5 text-primary font-bold' : 'text-slate-500 border-[#DED8D0]'}`}
                  >
                    Simulate
                  </Button>
                  <Button
                    onClick={() => openEditSlide(idx)}
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-[#1A1A1A] hover:text-[#B39254] border border-[#DED8D0] hover:bg-[#FAF8F5]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteSlide(idx)}
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-rose-500 hover:text-rose-700 border border-rose-100 hover:bg-rose-50/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Hero Slide Form Dialog Modal */}
      <Dialog open={isSlideModalOpen} onOpenChange={setIsSlideModalOpen}>
        <DialogContent className="max-w-2xl font-sans overflow-y-auto max-h-[90vh] p-0 rounded-lg border-[#DED8D0] shadow-2xl bg-white">
          <div className="bg-[#1A1A1A] text-[#FAF8F5] p-6 rounded-t-lg relative overflow-hidden border-b-2 border-primary">
            <DialogHeader className="relative z-10">
              <span className="bg-primary/20 text-primary text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded border border-primary/30 w-fit">
                Carousel Slide Details
              </span>
              <DialogTitle className="text-xl font-heading uppercase tracking-wider text-white mt-2">
                {editingSlideIndex !== null ? `Modify Banner #${editingSlideIndex + 1}` : "Create Carousel Banner"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1">
                Configure cover image, titles, prices, and redirects.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveSlide} className="p-6 space-y-6">
            
            {/* Section 1: Content details */}
            <div className="bg-[#FAF8F5] rounded border border-[#DED8D0]/60 p-4 space-y-4">
              <h4 className="text-[10px] font-heading font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#DED8D0]/40 pb-2">
                1. Textual Content & Labels
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="slide-tag" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                    Sub-tag label *
                  </Label>
                  <Input
                    id="slide-tag"
                    placeholder="e.g. New Collection"
                    className="bg-white border-[#DED8D0] focus-visible:ring-primary text-sm shadow-none"
                    required
                    value={slideFormData.tag}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, tag: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slide-collection" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                    Collection Name *
                  </Label>
                  <Input
                    id="slide-collection"
                    placeholder="e.g. Aradhana Collection"
                    className="bg-white border-[#DED8D0] focus-visible:ring-primary text-sm shadow-none"
                    required
                    value={slideFormData.collectionName}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, collectionName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slide-title" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                  Subtitle Description / Tagline *
                </Label>
                <Textarea
                  id="slide-title"
                  placeholder="Nature's most graceful bloom, set in diamond and gold."
                  className="bg-white border-[#DED8D0] focus-visible:ring-primary text-sm leading-relaxed shadow-none resize-none"
                  required
                  rows={2}
                  value={slideFormData.title}
                  onChange={(e) => setSlideFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            {/* Section 2: Links & Price */}
            <div className="bg-[#FAF8F5] rounded border border-[#DED8D0]/60 p-4 space-y-4">
              <h4 className="text-[10px] font-heading font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#DED8D0]/40 pb-2">
                2. Actions & Pricing
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="slide-price" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                    Pricing Badge (Optional)
                  </Label>
                  <Input
                    id="slide-price"
                    placeholder="Starting from ₹10,000"
                    className="bg-white border-[#DED8D0] focus-visible:ring-primary text-sm shadow-none"
                    value={slideFormData.price}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slide-cta" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                    CTA Button Label
                  </Label>
                  <Input
                    id="slide-cta"
                    placeholder="Explore Collection"
                    className="bg-white border-[#DED8D0] focus-visible:ring-primary text-sm shadow-none"
                    value={slideFormData.cta}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, cta: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slide-href" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                    CTA Action Target Link
                  </Label>
                  <Input
                    id="slide-href"
                    placeholder="/collections"
                    className="bg-white border-[#DED8D0] focus-visible:ring-primary text-sm shadow-none"
                    value={slideFormData.href}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, href: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Visual Background & Theme Overrides */}
            <div className="bg-[#FAF8F5] rounded border border-[#DED8D0]/60 p-4 space-y-4">
              <h4 className="text-[10px] font-heading font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#DED8D0]/40 pb-2">
                3. Banner Image & Layout Styling
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="slide-image" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                  Background Cover Image Path/URL *
                </Label>
                <Input
                  id="slide-image"
                  placeholder="e.g. /images/hero_slide_2.png or absolute URL"
                  className="bg-white border-[#DED8D0] focus-visible:ring-primary text-sm shadow-none font-mono text-xs"
                  required
                  value={slideFormData.image}
                  onChange={(e) => setSlideFormData(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="slide-textside" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                    Text Align Side
                  </Label>
                  <select
                    id="slide-textside"
                    className="flex h-9 w-full rounded border border-[#DED8D0] bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-slate-700 shadow-none"
                    value={slideFormData.textSide}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, textSide: e.target.value }))}
                  >
                    <option value="left">Left Side</option>
                    <option value="right">Right Side</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slide-overlay" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                    Overlay Gradient Style
                  </Label>
                  <select
                    id="slide-overlay"
                    className="flex h-9 w-full rounded border border-[#DED8D0] bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-slate-700 shadow-none"
                    value={slideFormData.overlay}
                    onChange={(e) => setSlideFormData(prev => ({ ...prev, overlay: e.target.value }))}
                  >
                    <option value="bg-gradient-to-r from-white/60 via-white/10 to-transparent">Light Overlay (Text Left)</option>
                    <option value="bg-gradient-to-l from-white/65 via-white/15 to-transparent">Light Overlay (Text Right)</option>
                    <option value="bg-gradient-to-l from-black/55 via-black/20 to-transparent">Dark Overlay (Text Right)</option>
                    <option value="bg-gradient-to-r from-black/60 via-black/20 to-transparent">Dark Overlay (Text Left)</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsSlideModalOpen(false)} className="border-[#DED8D0] hover:bg-[#FAF8F5] text-xs font-sans uppercase tracking-wider px-4">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-xs font-sans uppercase tracking-wider px-4">
                {editingSlideIndex !== null ? "Save Slide Changes" : "Create Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
