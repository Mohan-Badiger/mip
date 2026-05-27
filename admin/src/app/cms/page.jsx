"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ArrowUp,
  ArrowDown,
  Save,
  Loader2,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  Eye,
  Sliders,
  ImageIcon,
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  X,
  Globe,
  MessageSquare,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JewelryLoader from "@/components/jewelry-loader";

// Descriptive mapping explaining client storefront elements
const SECTION_DESCRIPTIONS = {
  hero: {
    title: "Hero Slideshow Banners",
    desc: "Main promotional slideshow carousel displayed at the top of the storefront homepage.",
    preview: "Slider Module"
  },
  exquisite: {
    title: "Luxury & Style Mosaic",
    desc: "Mosaic banner layout displaying a primary model portrait overlapping with necklace and bangle highlights.",
    preview: "Mosaic Grid"
  },
  cards: {
    title: "Campaign Lookbook Grid",
    desc: "Royal gold arch-framed grid showcasing specific jewelry campaign folders (e.g. Aradhana, Sunshine).",
    preview: "Theme Cards Grid"
  },
  categories: {
    title: "Categories & Budget Gift Tiers",
    desc: "Double showcase: list of categories (Bangles, Rings) followed by budget-tier gifting card options.",
    preview: "Categories & Gifts"
  },
  ycollection: {
    title: "Y Collection Spotlight Mosaic",
    desc: "Artistic editorial layout focusing on modern lightweight jewelry aimed at youth and everyday wear.",
    preview: "Youth Showcase"
  },
  gender: {
    title: "Shop By Gender Portals",
    desc: "Asymmetric visual links directing customers to Women, Men, or Kids collections.",
    preview: "Gender Split"
  },
  plan: {
    title: "My Choice Saving Plan Promo",
    desc: "The 11-month gold/silver saving scheme callout banner featuring an overlapping model.",
    preview: "Banner Scheme"
  },
  legacy: {
    title: "Heritage, Trust & Legacies",
    desc: "Customer assurance module highlighting BIS 916 hallmarking, GIA/IGI diamond grading, and legacy since 1925.",
    preview: "Assurance Block"
  },
  newsletter: {
    title: "Newsletter Signup Box",
    desc: "Footer subscription form inviting users to sign up for early collection access and care tips.",
    preview: "Input Form"
  }
};

export default function UnifiedCMSPage() {
  const [cmsData, setCmsData] = useState({
    heroSlides: [],
    sections: [],
    seo: { title: "", description: "" }
  });
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("layout"); // layout, banners, seo

  // Slides State
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
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  async function fetchCMS() {
    try {
      setLoading(true);
      const res = await fetch("/api/cms");
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        throw new Error(`API returned ${res.status}: Not JSON`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        // Ensure sections are sorted by order
        const sortedSections = [...json.data.sections].sort((a, b) => a.order - b.order);
        setCmsData({
          heroSlides: json.data.heroSlides || [],
          sections: sortedSections,
          seo: {
            title: json.data.seo?.title || "MIP Jewellers | Premium Gold & Diamond Collections",
            description: json.data.seo?.description || "Discover our exclusive collection of 22K gold, diamond, and platinum jewellery."
          }
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

  // Section modifiers
  const moveSection = (index, direction) => {
    const newSections = [...cmsData.sections];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

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

  const handleSectionNameChange = (id, newName) => {
    const newSections = cmsData.sections.map(sec =>
      sec.id === id ? { ...sec, name: newName } : sec
    );
    setCmsData(prev => ({ ...prev, sections: newSections }));
  };

  // Slideshow modifiers
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
    setCmsData(prev => ({ ...prev, heroSlides: newSlides }));
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

  // Global publish
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setSuccessMsg("");
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsData)
      });
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        throw new Error(`API returned ${res.status}: Not JSON`);
      }
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("MIP Storefront design saved & updated live!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(json.error || "Failed to publish designs.");
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-125 text-slate-400 font-sans bg-bg-cream">
        <JewelryLoader size="md" label="Opening Consolidated CMS Dashboard..." />
      </div>
    );
  }

  const activeSlidesCount = cmsData.heroSlides.length;
  const currentPreviewSlide = cmsData.heroSlides[previewSlideIdx];

  return (
    <div className="flex-1 space-y-6 p-6 md:p-10 bg-bg-cream min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-heading uppercase text-primary font-bold">
            Consolidated Storefront Workspace
          </span>
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-text-dark mt-1 font-semibold uppercase">
            Website CMS & Design Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your homepage canvas sections, configure banners with direct uploads, and tune live Google search SEO metadata from a single page.
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
            className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream font-sans text-xs uppercase tracking-wider px-6 py-5 shadow-md transition-all"
          >
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> Publishing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4 text-primary" /> Save & Publish Live
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="flex border-b border-[#DED8D0] mb-6">
        <button 
          onClick={() => setActiveTab("layout")} 
          className={`pb-3 text-xs uppercase tracking-wider font-semibold mr-6 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'layout' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <LayoutGrid className="w-4 h-4" /> Homepage Canvas (Layout)
        </button>
        <button 
          onClick={() => setActiveTab("banners")} 
          className={`pb-3 text-xs uppercase tracking-wider font-semibold mr-6 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'banners' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <ImageIcon className="w-4 h-4" /> Hero Slideshow Banners
        </button>
        <button 
          onClick={() => setActiveTab("seo")} 
          className={`pb-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'seo' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Globe className="w-4 h-4" /> Google SEO & Metadata
        </button>
      </div>

      {/* TAB CONTENT: Layout Arranger Canvas */}
      {activeTab === "layout" && (
        <div className="space-y-6">
          <div className="border-b border-[#DED8D0]/50 pb-2">
            <h3 className="font-heading text-lg text-text-dark uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" /> Visual Sequence Canvas
            </h3>
            <p className="text-xs text-muted-foreground">Modify custom titles, toggle visibility states, and re-order page sections. Changes will sync instantly to the client homepage.</p>
          </div>

          <div className="grid gap-4 max-w-4xl">
            {cmsData.sections.map((section, idx) => {
              const info = SECTION_DESCRIPTIONS[section.id] || { title: section.name, desc: "Homepage layout element block", preview: "Layout Block" };
              return (
                <Card 
                  key={section.id}
                  className={`border-[#DED8D0] bg-white transition-all duration-300 hover:shadow-sm
                    ${section.active ? 'opacity-100' : 'opacity-55 bg-bg-cream/50 border-dashed'}`}
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-bg-cream border border-[#DED8D0] text-brand-gold flex items-center justify-center text-xs font-bold font-heading shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading text-sm text-text-dark font-semibold uppercase tracking-wider">
                              {info.title}
                            </h4>
                            <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 font-bold uppercase tracking-widest">
                              {info.preview}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                            {info.desc} (ID: <span className="font-mono">{section.id}</span>)
                          </span>
                        </div>
                      </div>

                      {/* Customize section title input */}
                      {section.active && (
                        <div className="space-y-1 pl-9">
                          <Label htmlFor={`title-${section.id}`} className="text-[9px] font-heading tracking-wider uppercase text-slate-500 block">Custom Headline Title on Website</Label>
                          <Input 
                            id={`title-${section.id}`}
                            value={section.name}
                            onChange={(e) => handleSectionNameChange(section.id, e.target.value)}
                            placeholder="e.g. Unique Modern Collection"
                            className="bg-white border-[#DED8D0] text-xs max-w-lg shadow-none focus-visible:ring-primary h-8"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 md:border-l md:pl-4 border-slate-100 shrink-0 self-end md:self-auto justify-end w-full md:w-auto">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${section.id}`} className="text-[10px] font-heading tracking-wider uppercase text-slate-500 cursor-pointer">
                          {section.active ? "Visible" : "Hidden"}
                        </Label>
                        <Switch 
                          id={`active-${section.id}`}
                          checked={section.active}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                      </div>

                      <div className="flex items-center gap-1 border-l pl-3 border-slate-100">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-slate-400 hover:text-primary disabled:opacity-20"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, -1)}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-slate-400 hover:text-primary disabled:opacity-20"
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
      )}

      {/* TAB CONTENT: Banners Manager */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          
          {/* Live Simulator Panel */}
          {activeSlidesCount > 0 && currentPreviewSlide && (
            <Card className="border-[#DED8D0] shadow-sm overflow-hidden bg-slate-950 text-white rounded-lg max-w-5xl">
              <div className="bg-text-dark border-b border-slate-800 px-6 py-3 flex items-center justify-between">
                <span className="text-[10px] font-heading tracking-wider text-slate-400 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Slideshow Simulator
                </span>
                <span className="text-[10px] font-sans font-semibold bg-slate-850 text-slate-350 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-wider">
                  Slide {previewSlideIdx + 1} of {activeSlidesCount}
                </span>
              </div>
              <div className="relative h-64 md:h-80 bg-slate-900 flex items-center">
                {currentPreviewSlide.image ? (
                  currentPreviewSlide.image.startsWith('data:') ? (
                    <img
                      src={currentPreviewSlide.image}
                      alt={currentPreviewSlide.collectionName}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-300"
                    />
                  ) : (
                    <Image
                      src={currentPreviewSlide.image}
                      alt={currentPreviewSlide.collectionName}
                      fill
                      sizes="(max-width: 768px) 100vw, 80vw"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-300"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-650" />
                  </div>
                )}
                
                <div className={`absolute inset-0 ${currentPreviewSlide.overlay}`} />

                <div className="absolute inset-0 flex items-center px-8 md:px-16 z-10">
                  <div className={`max-w-[80%] md:max-w-[50%] flex flex-col gap-2
                    ${currentPreviewSlide.textSide === 'right' ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'}`}>
                    <span className="text-[9px] tracking-[0.25em] font-heading font-semibold text-primary uppercase">
                      {currentPreviewSlide.tag}
                    </span>
                    <h3 className="font-heading text-xl md:text-3xl font-bold uppercase tracking-wider text-white leading-tight">
                      {currentPreviewSlide.collectionName}
                    </h3>
                    <p className="text-[11px] text-slate-200 line-clamp-2 max-w-sm font-sans leading-relaxed">
                      {currentPreviewSlide.title}
                    </p>
                    {currentPreviewSlide.price && (
                      <p className="text-[11px] font-bold text-primary font-sans">
                        {currentPreviewSlide.price}
                      </p>
                    )}
                    <span className="mt-1 text-[9px] font-heading font-bold uppercase tracking-widest border-b border-primary pb-0.5 text-white">
                      {currentPreviewSlide.cta}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewSlideIdx(prev => (prev - 1 + activeSlidesCount) % activeSlidesCount)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors z-20"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setPreviewSlideIdx(prev => (prev + 1) % activeSlidesCount)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors z-20"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </Card>
          )}

          {/* Slides List Registry */}
          <Card className="border-[#DED8D0] bg-white shadow-sm max-w-5xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-text-dark font-heading text-sm uppercase tracking-wider">
                  Promo Banners Registry
                </CardTitle>
                <CardDescription className="text-xs">
                  Create, edit, or re-order scrolling slides shown in the header area.
                </CardDescription>
              </div>
              <Button onClick={openAddSlide} className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream text-xs font-sans uppercase tracking-wider px-3 h-8">
                <Plus className="mr-1.5 h-4 w-4 text-primary" /> Add Banner
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {cmsData.heroSlides.length === 0 ? (
                <div className="text-center py-16 text-slate-400 border border-dashed border-[#DED8D0] rounded-lg">
                  <ImageIcon className="w-10 h-10 text-[#DED8D0] mx-auto mb-2" />
                  <p className="text-xs font-semibold uppercase tracking-widest font-heading text-text-dark">No slides configured</p>
                  <p className="text-[11px] mt-0.5">Click "Add Banner" to upload cover slides.</p>
                </div>
              ) : (
                cmsData.heroSlides.map((slide, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between border border-[#DED8D0]/60 rounded-lg p-4 bg-white hover:shadow-xs transition-all gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-24 h-14 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                        {slide.image ? (
                          slide.image.startsWith('data:') ? (
                            <img
                              src={slide.image}
                              alt={slide.collectionName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image 
                              src={slide.image} 
                              alt={slide.collectionName} 
                              fill
                              sizes="96px"
                              className="object-cover" 
                            />
                          )
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold font-sans tracking-widest uppercase">
                          Slide #{idx + 1}
                        </span>
                        <h4 className="font-bold text-text-dark font-heading tracking-wider text-xs uppercase">
                          {slide.collectionName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">{slide.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                      <div className="flex items-center gap-1 border-r pr-2 border-slate-100 mr-2">
                        <Button
                          onClick={() => moveSlide(idx, -1)}
                          disabled={idx === 0}
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground disabled:opacity-20"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          onClick={() => moveSlide(idx, 1)}
                          disabled={idx === cmsData.heroSlides.length - 1}
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground disabled:opacity-20"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => setPreviewSlideIdx(idx)}
                        variant="outline"
                        size="sm"
                        className={`text-[9px] font-sans uppercase tracking-wider h-7 px-2 ${previewSlideIdx === idx ? 'border-primary bg-primary/5 text-primary font-bold' : 'text-slate-500 border-[#DED8D0]'}`}
                      >
                        Simulate
                      </Button>
                      <Button
                        onClick={() => openEditSlide(idx)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-slate-500 hover:text-brand-gold border border-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteSlide(idx)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-rose-500 hover:text-rose-700 border border-rose-100 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: SEO Configuration */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="border-b border-[#DED8D0]/50 pb-2">
            <h3 className="font-heading text-lg text-text-dark uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Search & Crawl Settings
            </h3>
            <p className="text-xs text-muted-foreground">Consolidate metadata configurations, customize descriptions, and review search previews in real time.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 items-start max-w-7xl">
            {/* Form */}
            <Card className="border-[#DED8D0] bg-white shadow-sm">
              <CardHeader className="border-b border-slate-50">
                <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Meta Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="seo-title" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Meta Title Tag</Label>
                    <span className={`text-[10px] font-mono ${cmsData.seo.title.length > 60 ? "text-rose-500 font-bold" : "text-emerald-600"}`}>
                      {cmsData.seo.title.length} / 60 chars
                    </span>
                  </div>
                  <Input 
                    id="seo-title"
                    value={cmsData.seo.title}
                    onChange={(e) => setCmsData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
                    placeholder="e.g. MIP Jewellers | Luxury Handcrafted Gold Jewelry"
                  />
                  <p className="text-[9px] text-slate-400">Google recommends keeping title tags under 60 characters to avoid truncation.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="seo-desc" className="text-[10px] font-heading tracking-wider uppercase text-slate-700">Meta Description</Label>
                    <span className={`text-[10px] font-mono ${cmsData.seo.description.length > 160 ? "text-rose-500 font-bold" : "text-emerald-600"}`}>
                      {cmsData.seo.description.length} / 160 chars
                    </span>
                  </div>
                  <Textarea 
                    id="seo-desc"
                    value={cmsData.seo.description}
                    onChange={(e) => setCmsData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                    className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none min-h-25 leading-relaxed resize-none"
                    placeholder="Write a clear search result summary explaining what MIP offers..."
                  />
                  <p className="text-[9px] text-slate-400">Keep descriptions between 120 and 160 characters for optimal display in snippet windows.</p>
                </div>

              </CardContent>
            </Card>

            {/* Simulators */}
            <div className="space-y-4">
              {/* Google Result Preview */}
              <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
                <CardHeader className="bg-bg-cream border-b border-[#DED8D0]/60 pb-3">
                  <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-brand-gold" /> Google Snippet Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 pb-6 px-6 space-y-1">
                  <div className="flex items-center gap-1 text-[#202124] text-[10px]">
                    <span className="bg-[#f1f3f4] text-[#3c4043] rounded-full px-1.5 py-0.2 font-semibold">M</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-sans">MIP Jewellers</span>
                      <span className="text-[9px] text-[#5f6368] leading-none">https://www.mipjewellers.com</span>
                    </div>
                  </div>
                  <h3 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-sans leading-tight pt-1 font-medium truncate">
                    {cmsData.seo.title || "MIP Jewellers | Premium Gold & Diamond Collections"}
                  </h3>
                  <p className="text-xs text-[#4d5156] leading-relaxed max-w-xl font-sans pt-0.5 wrap-break-word">
                    {cmsData.seo.description || "Discover our exclusive collection of 22K gold, diamond, and platinum jewellery."}
                  </p>
                </CardContent>
              </Card>

              {/* Social Share Preview */}
              <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
                <CardHeader className="bg-bg-cream border-b border-[#DED8D0]/60 pb-3">
                  <CardTitle className="text-xs font-heading uppercase tracking-wider text-text-dark flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-brand-gold" /> Social Share Card Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-w-md bg-white shadow-sm">
                    <div className="relative aspect-[1.91] bg-slate-100 flex flex-col items-center justify-center p-3 border-b border-slate-200">
                      <Globe className="w-8 h-8 text-brand-gold/40 mb-1" />
                      <span className="font-heading uppercase tracking-widest text-[8px] text-brand-gold font-bold">MIP OG Banner</span>
                      <span className="text-[7px] text-slate-400 font-mono mt-0.5">/images/social_share_banner.png</span>
                    </div>
                    <div className="p-3 bg-[#f2f3f5] font-sans text-left space-y-0.5">
                      <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">mipjewellers.com</span>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {cmsData.seo.title || "MIP Jewellers | Premium Gold & Diamond Collections"}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {cmsData.seo.description || "Discover our exclusive collection of 22K gold, diamond, and platinum jewellery."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Hero Slide Form Dialog Modal */}
      <Dialog open={isSlideModalOpen} onOpenChange={setIsSlideModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border-[#DED8D0] shadow-2xl bg-white font-sans **:data-[slot=dialog-close]:text-white/80 **:data-[slot=dialog-close]:hover:text-white **:data-[slot=dialog-close]:hover:bg-white/10 **:data-[slot=dialog-close]:top-4 **:data-[slot=dialog-close]:right-4">
          <div className="bg-text-dark text-bg-cream p-5 rounded-t-2xl relative overflow-hidden border-b border-brand-gold">
            <DialogHeader className="relative z-10">
              <span className="bg-primary/20 text-primary text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-primary/30 w-fit">
                Carousel Slide Details
              </span>
              <DialogTitle className="text-lg font-heading uppercase tracking-wider text-white mt-1.5">
                {editingSlideIndex !== null ? `Modify Banner #${editingSlideIndex + 1}` : "Create Carousel Banner"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-0.5">
                Configure cover image, titles, prices, and redirects.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveSlide} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-5">
              {/* Left Column: Text Content & Actions */}
              <div className="space-y-4">
                {/* Textual info */}
                <div className="bg-bg-cream rounded-xl border border-[#DED8D0]/60 p-4 space-y-3 shadow-sm">
                  <h4 className="text-[9px] font-heading font-bold text-text-dark uppercase tracking-wider border-b border-[#DED8D0]/40 pb-1.5">
                    1. Textual Content & Labels
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="slide-tag" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                        Sub-tag label *
                      </Label>
                      <Input
                        id="slide-tag"
                        placeholder="e.g. New Collection"
                        className="bg-white border-[#DED8D0] text-xs h-8 shadow-none rounded-lg"
                        required
                        value={slideFormData.tag}
                        onChange={(e) => setSlideFormData(prev => ({ ...prev, tag: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="slide-collection" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                        Collection Name *
                      </Label>
                      <Input
                        id="slide-collection"
                        placeholder="e.g. Aradhana Collection"
                        className="bg-white border-[#DED8D0] text-xs h-8 shadow-none rounded-lg"
                        required
                        value={slideFormData.collectionName}
                        onChange={(e) => setSlideFormData(prev => ({ ...prev, collectionName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="slide-title" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                      Subtitle Description / Tagline *
                    </Label>
                    <Textarea
                      id="slide-title"
                      placeholder="Nature's most graceful bloom, set in diamond and gold."
                      className="bg-white border-[#DED8D0] text-xs leading-relaxed shadow-none resize-none rounded-lg"
                      required
                      rows={2}
                      value={slideFormData.title}
                      onChange={(e) => setSlideFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-bg-cream rounded-xl border border-[#DED8D0]/60 p-4 space-y-3 shadow-sm">
                  <h4 className="text-[9px] font-heading font-bold text-text-dark uppercase tracking-wider border-b border-[#DED8D0]/40 pb-1.5">
                    2. Actions & Pricing
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="slide-price" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                        Price (Optional)
                      </Label>
                      <Input
                        id="slide-price"
                        placeholder="Starting ₹10,000"
                        className="bg-white border-[#DED8D0] text-xs h-8 shadow-none rounded-lg"
                        value={slideFormData.price}
                        onChange={(e) => setSlideFormData(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="slide-cta" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                        CTA Label
                      </Label>
                      <Input
                        id="slide-cta"
                        placeholder="Explore"
                        className="bg-white border-[#DED8D0] text-xs h-8 shadow-none rounded-lg"
                        value={slideFormData.cta}
                        onChange={(e) => setSlideFormData(prev => ({ ...prev, cta: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="slide-href" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                        Target Link
                      </Label>
                      <Input
                        id="slide-href"
                        placeholder="/collections"
                        className="bg-white border-[#DED8D0] text-xs h-8 shadow-none rounded-lg"
                        value={slideFormData.href}
                        onChange={(e) => setSlideFormData(prev => ({ ...prev, href: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Setup */}
              <div className="space-y-4">
                <div className="bg-bg-cream rounded-xl border border-[#DED8D0]/60 p-4 space-y-3 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-[9px] font-heading font-bold text-text-dark uppercase tracking-wider border-b border-[#DED8D0]/40 pb-1.5 mb-2">
                      3. Banner Image & Layout Styling
                    </h4>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                          Background Image *
                        </Label>
                        
                        {slideFormData.image ? (
                          <div className="relative w-full aspect-video rounded-lg border border-[#DED8D0] overflow-hidden bg-white shadow-sm group mb-2">
                            <img src={slideFormData.image} alt="Banner background preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setSlideFormData(prev => ({ ...prev, image: "" }))}
                                className="p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full aspect-video rounded-lg border-2 border-dashed border-[#DED8D0]/60 flex flex-col items-center justify-center text-slate-400 bg-white mb-2">
                            <ImageIcon className="w-7 h-7 text-slate-350 mb-1" />
                            <span className="text-[10px] text-muted-foreground">No banner image uploaded</span>
                          </div>
                        )}

                        {/* File Upload Trigger */}
                        <div className="border border-dashed border-[#DED8D0] rounded-xl p-3 bg-white hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSlideFormData(prev => ({ ...prev, image: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors mb-0.5" />
                          <span className="text-[11px] font-semibold text-slate-650">Upload Image File</span>
                          <span className="text-[8px] text-slate-400">Drag & drop or click</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="slide-textside" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                            Text Align Side
                          </Label>
                          <select
                            id="slide-textside"
                            className="flex h-8 w-full rounded-lg border border-[#DED8D0] bg-white px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-slate-700"
                            value={slideFormData.textSide}
                            onChange={(e) => setSlideFormData(prev => ({ ...prev, textSide: e.target.value }))}
                          >
                            <option value="left">Left Side</option>
                            <option value="right">Right Side</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="slide-overlay" className="text-[9px] font-heading font-bold text-muted-foreground tracking-wider uppercase">
                            Overlay Gradient
                          </Label>
                          <select
                            id="slide-overlay"
                            className="flex h-8 w-full rounded-lg border border-[#DED8D0] bg-white px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-slate-700"
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
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsSlideModalOpen(false)} className="border-[#DED8D0] hover:bg-bg-cream text-xs font-sans uppercase tracking-wider px-4 rounded-lg h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream text-xs font-sans uppercase tracking-wider px-4 rounded-lg h-9">
                {editingSlideIndex !== null ? "Save Slide Changes" : "Create Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
