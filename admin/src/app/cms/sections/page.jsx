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
  Sliders,
  Save,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import JewelryLoader from "@/components/jewelry-loader";

export default function SectionsPage() {
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
        const sortedSections = [...json.data.sections].sort((a, b) => a.order - b.order);
        setCmsData({ ...json.data, sections: sortedSections });
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

  const handleSectionNameChange = (id, newName) => {
    const newSections = cmsData.sections.map(sec =>
      sec.id === id ? { ...sec, name: newName } : sec
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
        setSuccessMsg("Layout sections configuration saved!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(json.error || "Failed to publish sections.");
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
        <JewelryLoader size="md" label="Assembling Sections Panel..." />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <Link href="/cms" className="text-xs uppercase tracking-widest text-[#B39254] hover:text-[#1A1A1A] flex items-center gap-1.5 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront Designer
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] mt-2 font-semibold uppercase">
            Storefront Layout Sections
          </h1>
          <p className="text-xs text-muted-foreground">
            Arrange homepage segments, customize headlines, and toggle layout nodes.
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
                <Save className="mr-2 h-4 w-4 text-primary" /> Save Placements
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Arrangement Table/Registry */}
      <Card className="border-[#DED8D0] bg-white shadow-sm max-w-4xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-[#1A1A1A] font-heading text-lg uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Arrangement Sequence
          </CardTitle>
          <CardDescription className="text-xs">
            Modify text headlines, toggle section visibility, and re-order layout sequence.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {cmsData.sections.map((section, idx) => (
            <div
              key={section.id}
              className={`flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-5 transition-all duration-200 bg-white gap-4
                ${section.active ? 'border-[#DED8D0] shadow-sm' : 'border-dashed border-[#DED8D0]/60 opacity-60 bg-[#FAF8F5]/40'}`}
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#DED8D0] text-[#B39254] flex items-center justify-center text-xs font-bold font-heading">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#B39254] font-semibold block">Section Type: {section.type}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">System Identifier: {section.id}</span>
                  </div>
                </div>

                {/* Edit Headline Input */}
                <div className="space-y-1">
                  <Label htmlFor={`name-${section.id}`} className="text-[9px] font-heading tracking-wider uppercase text-muted-foreground">Headline Title</Label>
                  <Input
                    id={`name-${section.id}`}
                    value={section.name}
                    onChange={(e) => handleSectionNameChange(section.id, e.target.value)}
                    disabled={!section.active}
                    className="bg-white border-[#DED8D0] text-xs max-w-lg shadow-none focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 md:border-l md:pl-4 border-slate-100 shrink-0 self-end md:self-auto justify-end w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${section.id}`} className="text-[10px] font-heading tracking-wider uppercase text-muted-foreground cursor-pointer">
                    {section.active ? "Active" : "Disabled"}
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
                    className="w-8 h-8 text-muted-foreground hover:text-primary disabled:opacity-20"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-primary disabled:opacity-20"
                    disabled={idx === cmsData.sections.length - 1}
                    onClick={() => moveSection(idx, 1)}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
