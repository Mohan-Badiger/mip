"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon, Copy, Trash2, UploadCloud, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MediaPage() {
  const mediaFiles = [
    { name: "bridal_choker_main.jpg", size: "480 KB", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600", category: "Products" },
    { name: "diwali_campaign_banner.png", size: "1.2 MB", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200", category: "CMS Banners" },
    { name: "gold_coins_saving.jpg", size: "290 KB", url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=600", category: "Plans" },
    { name: "signature_diamond_ring.jpg", size: "340 KB", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600", category: "Products" }
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-amber-500" /> Media Asset Library
          </h2>
          <p className="text-sm text-slate-500">
            Upload and copy asset URLs for jewelry photos, promotional flyers, and site banners.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div className="border border-dashed border-slate-200 rounded-lg p-10 bg-slate-50/20 text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50/50 transition-colors">
        <UploadCloud className="w-10 h-10 text-slate-400" />
        <p className="text-sm font-semibold text-slate-650">Drag jewelry assets here, or browse local folders</p>
        <p className="text-xs text-slate-400">Supports PNG, JPEG, WEBP up to 5MB</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {mediaFiles.map((m) => (
          <Card key={m.name} className="overflow-hidden border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
              <Image 
                src={m.url} 
                alt={m.name} 
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover" 
              />
              <Badge className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] uppercase tracking-wider">
                {m.category}
              </Badge>
            </div>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs font-semibold text-slate-700 truncate">{m.name}</CardTitle>
              <CardDescription className="text-[10px] text-slate-400 font-mono">{m.size}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex justify-end gap-1.5 mt-auto border-t border-slate-50 bg-slate-50/40">
              <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-slate-700" onClick={() => navigator.clipboard.writeText(m.url)}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-400 hover:text-slate-700" onClick={() => window.open(m.url, '_blank')}>
                <LinkIcon className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
