"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Settings, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null); // null means creating
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bannerImage: ""
  });

  async function loadData() {
    try {
      setLoading(true);
      const [colRes, prodRes] = await Promise.all([
        fetch("/api/collections"),
        fetch("/api/products")
      ]);
      const colJson = await colRes.json();
      const prodJson = await prodRes.json();
      if (colJson.success) setCollections(colJson.data);
      if (prodJson.success) setProducts(prodJson.data);
    } catch (err) {
      console.error("Failed to load collections page data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    setSelectedCollection(null);
    setFormData({ name: "", description: "", bannerImage: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name || "",
      description: collection.description || "",
      bannerImage: collection.bannerImage || ""
    });
    setIsDialogOpen(true);
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      const url = "/api/collections";
      const method = selectedCollection ? "PUT" : "POST";
      const payload = selectedCollection 
        ? { ...formData, _id: selectedCollection._id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setIsDialogOpen(false);
        setFormData({ name: "", description: "", bannerImage: "" });
        loadData();
      } else {
        alert(json.error || "Failed to save collection");
      }
    } catch (err) {
      console.error("Failed to save collection:", err);
      alert("Error occurred while saving collection.");
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;
    const count = getProductCount(selectedCollection._id);
    const msg = count > 0 
      ? `Warning: There are ${count} products in this collection. Deleting it will unset their collection fields. Are you sure you want to permanently delete "${selectedCollection.name}"?`
      : `Are you sure you want to permanently delete "${selectedCollection.name}"?`;
      
    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/collections?id=${selectedCollection._id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setIsDialogOpen(false);
        setFormData({ name: "", description: "", bannerImage: "" });
        loadData();
      } else {
        alert(json.error || "Failed to delete collection");
      }
    } catch (err) {
      console.error("Failed to delete collection:", err);
      alert("Error occurred while deleting collection.");
    }
  };

  const getProductCount = (colId) => {
    return products.filter(p => p.collectionRef?._id === colId || p.collectionRef === colId).length;
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800">
            Collections & Themes
          </h2>
          <p className="text-sm text-slate-500">
            Group your products into campaigns, seasons, or showcase layouts.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Create Collection
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <JewelryLoader size="md" label="Loading campaigns and collections..." />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const count = getProductCount(collection._id);
            return (
              <Card
                key={collection._id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {collection.bannerImage ? (
                      <Image 
                         src={collection.bannerImage} 
                         alt={collection.name} 
                         fill
                         sizes="(max-width: 768px) 100vw, 33vw"
                         className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    )}
                    <Badge className="absolute top-2 right-2 bg-slate-950/80 text-white hover:bg-slate-950/80">
                      Active
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-secondary uppercase text-slate-800 tracking-wider">
                      {collection.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {collection.description || "No description provided."}
                    </p>
                    <div className="text-xs text-slate-500 font-mono">
                      Slug: {collection.slug}
                    </div>
                  </CardContent>
                </div>
                <CardContent className="pt-0 border-t border-slate-50 mt-auto bg-slate-50/50 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">{count} Active Products</span>
                  <Button onClick={() => openEditDialog(collection)} variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-slate-800">
                    <Settings className="w-3.5 h-3.5 mr-1" /> Config
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <Card 
            onClick={openCreateDialog}
            className="flex flex-col items-center justify-center h-full min-h-62.5 border-dashed border-2 border-slate-200 bg-slate-50/30 hover:bg-slate-50/70 hover:border-slate-300 cursor-pointer transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                <Plus className="w-6 h-6 text-slate-600" />
              </div>
              <span className="font-semibold text-sm text-slate-600">New Collection</span>
              <span className="text-xs text-slate-400">Add a custom display block</span>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto font-sans p-0 rounded-2xl border-slate-100 shadow-2xl bg-white **:data-[slot=dialog-close]:text-white/80 **:data-[slot=dialog-close]:hover:text-white **:data-[slot=dialog-close]:hover:bg-white/10 **:data-[slot=dialog-close]:top-4 **:data-[slot=dialog-close]:right-4">
          <div className="bg-slate-900/90 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400/25 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-400/30">
                  Premium Campaign Manager
                </span>
              </div>
              <DialogTitle className="text-2xl font-secondary uppercase tracking-wide text-white">
                {selectedCollection ? "Edit Collection Details" : "Create New Campaign Collection"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Configure collection metadata, themed descriptions, and display banners synced directly to storefront showcases.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveCollection} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: Basic Details */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-700" /> Collection Details
                  </h4>
                  
                  <div className="space-y-4 pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="col-name" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Collection Name *</Label>
                      <Input
                        id="col-name"
                        placeholder="e.g. Royal Antique Collection"
                        required
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="col-desc" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Description</Label>
                      <Textarea
                        id="col-desc"
                        placeholder="Short pitch or summary describing this themed campaign or collection style..."
                        rows={5}
                        className="bg-white border-slate-200 text-sm leading-relaxed shadow-sm resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-slate-400 font-medium block mt-4">
                  * Campaigns segment catalogue listings, grouping them under custom theme banners.
                </span>
              </div>

              {/* Right Column: Imagery */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-700" /> Collection Banner Image
                  </h4>

                  <div className="pt-3 space-y-4">
                    {/* Image Preview Thumbnail */}
                    {formData.bannerImage ? (
                      <div className="relative w-full aspect-video rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm group">
                        <img src={formData.bannerImage} alt="Collection Banner preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, bannerImage: "" }))}
                            className="p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-450 bg-white">
                        <ImageIcon className="w-8 h-8 text-slate-350 mb-2" />
                        <span className="text-xs font-medium">No banner image uploaded</span>
                      </div>
                    )}

                    {/* Drag & Drop File Upload Area */}
                    <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group min-h-22.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, bannerImage: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors mb-1" />
                      <span className="text-xs font-semibold text-slate-600">Upload Image File</span>
                      <span className="text-[9px] text-slate-400">Drag & drop or click</span>
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-slate-400 font-medium block mt-4">
                  * Dynamic thematic banners draw instant attention on client landing page modules.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end">
              {selectedCollection && (
                <Button type="button" variant="destructive" onClick={handleDeleteCollection} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg h-9 mr-auto">
                  Delete Collection
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-200 hover:bg-slate-50 text-xs rounded-lg h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg h-9">
                {selectedCollection ? "Save Changes" : "Create Collection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
