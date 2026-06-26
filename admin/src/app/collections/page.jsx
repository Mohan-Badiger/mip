"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Settings, Loader2, Sparkles, UploadCloud, X, Search, LayoutGrid } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";
import { Switch } from "@/components/ui/switch";
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

const parseImageAdjustments = (val) => {
  if (!val) return { x: 50, y: 50, scale: 1 };
  const parts = val.split(' ');
  if (parts.length === 3) {
    return {
      x: parseInt(parts[0]) || 50,
      y: parseInt(parts[1]) || 50,
      scale: parseFloat(parts[2]) || 1
    };
  }
  const yVal = parseInt(val) || 50;
  return { x: 50, y: yVal, scale: 1 };
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null); // null means creating
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bannerImage: "",
    imagePosition: "50%"
  });
  const [uploading, setUploading] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingImage(true);
    updateFocalPoint(e);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingImage) return;
    updateFocalPoint(e);
  };

  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDraggingImage(false);
  };

  const updateFocalPoint = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (clientX === undefined || clientY === undefined) return;
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    const x = Math.max(0, Math.min(100, Math.round(rawX)));
    const y = Math.max(0, Math.min(100, Math.round(rawY)));
    const dialogAdj = parseImageAdjustments(formData.imagePosition);
    setFormData(prev => ({
      ...prev,
      imagePosition: `${x} ${y} ${dialogAdj.scale}`
    }));
  };

  const resetImagePosition = () => {
    setFormData(prev => ({
      ...prev,
      imagePosition: "50 50 1.0"
    }));
  };

  // Manage Products Dialog State
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [activeCollectionForProducts, setActiveCollectionForProducts] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [savingProducts, setSavingProducts] = useState(false);

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
    setFormData({ name: "", description: "", bannerImage: "", imagePosition: "50%" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name || "",
      description: collection.description || "",
      bannerImage: collection.bannerImage || "",
      imagePosition: collection.imagePosition || "50%"
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Compress image client-side to maximum 1200x800 and 75% quality
      const compressedBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
            resolve(dataUrl);
          };
          img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
      });

      // 2. Upload to Cloudinary via /api/upload
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressedBase64 })
      });
      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          bannerImage: data.url
        }));
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error occurred during image upload.");
    } finally {
      setUploading(false);
    }
  };

  const openProductsDialog = (collection) => {
    setActiveCollectionForProducts(collection);

    // Find all products that currently belong to this collection
    const currentProductIds = products
      .filter(p => p.collectionRef?._id === collection._id || p.collectionRef === collection._id)
      .map(p => p._id);

    setSelectedProductIds(new Set(currentProductIds));
    setProductSearchQuery("");
    setIsProductsDialogOpen(true);
  };

  const toggleProductSelection = (productId) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSaveProductsToCollection = async () => {
    if (!activeCollectionForProducts) return;
    setSavingProducts(true);

    try {
      const collectionId = activeCollectionForProducts._id;
      const updates = [];

      // Identify changes and prepare update requests
      products.forEach(p => {
        const belongsInDb = p.collectionRef?._id === collectionId || p.collectionRef === collectionId;
        const belongsInSelection = selectedProductIds.has(p._id);

        if (belongsInSelection && !belongsInDb) {
          // Add product to this collection
          updates.push({ _id: p._id, collectionRef: collectionId });
        } else if (!belongsInSelection && belongsInDb) {
          // Remove product from this collection
          updates.push({ _id: p._id, collectionRef: 'none_ref' });
        }
      });

      if (updates.length > 0) {
        // Execute updates concurrently using existing PUT /api/products
        const promises = updates.map(update =>
          fetch("/api/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update)
          }).then(res => res.json())
        );

        const results = await Promise.all(promises);
        const failures = results.filter(r => !r.success);

        if (failures.length > 0) {
          alert(`Warning: Failed to update ${failures.length} products.`);
        }
      }

      setIsProductsDialogOpen(false);
      loadData(); // Reload all data to refresh card product counts and states
    } catch (err) {
      console.error("Failed to save products selection:", err);
      alert("Error occurred while saving products selection.");
    } finally {
      setSavingProducts(false);
    }
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

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
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection, index) => {
            const count = getProductCount(collection._id);
            return (
              <Card
                key={collection._id}
                className="overflow-hidden bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-100 flex flex-col rounded-xl shadow-xs justify-between p-0 gap-0"
              >
                <div>
                  <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100/50 group">
                    {collection.bannerImage ? (
                      (() => {
                        const adj = parseImageAdjustments(collection.imagePosition);
                        return (
                          <Image
                            src={collection.bannerImage}
                            alt={collection.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500"
                            style={{
                              objectPosition: `${adj.x}% ${adj.y}%`,
                              transform: `scale(${adj.scale})`,
                              transformOrigin: `${adj.x}% ${adj.y}%`
                            }}
                            priority={index < 3}
                          />
                        );
                      })()
                    ) : (
                      <ImageIcon className="h-9 w-9 text-slate-300" />
                    )}
                  </div>

                  <div className="p-4 space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase font-mono">
                      <span className="text-brand-gold">Slug: {collection.slug}</span>
                      <span className="text-slate-400 font-semibold">{count} Products</span>
                    </div>
                    <h3 className="text-base font-semibold tracking-wide font-secondary uppercase text-slate-800 line-clamp-1">
                      {collection.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-3">
                      {collection.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      onClick={() => openProductsDialog(collection)}
                      variant="outline"
                      className="flex-1 h-9 text-xs font-bold border-brand-gold/30 text-brand-gold hover:bg-brand-gold/5 rounded-lg px-3"
                    >
                      <LayoutGrid className="w-4 h-4 mr-2 shrink-0" /> Manage Products
                    </Button>
                    <Button
                      onClick={() => openEditDialog(collection)}
                      variant="secondary"
                      className="h-9 w-9 p-0 bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-800 rounded-lg shrink-0 border border-slate-200/40"
                      title="Edit Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          <Card
            onClick={openCreateDialog}
            className="flex flex-col items-center justify-center min-h-64 border-dashed border-2 border-slate-200 bg-slate-50/20 hover:bg-slate-50/60 hover:border-slate-350 cursor-pointer rounded-xl transition-all duration-300 group p-4 gap-2"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 transition-transform duration-300 group-hover:scale-105">
                <Plus className="w-6 h-6 text-slate-500" />
              </div>
              <span className="font-semibold text-sm text-slate-700">New Collection</span>
              <span className="text-xs text-slate-400 max-w-40">Add a custom themed catalog block</span>
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
                    {/* Image Previews & Crop Simulator */}
                    {formData.bannerImage ? (
                      (() => {
                        const dialogAdj = parseImageAdjustments(formData.imagePosition);
                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Storefront Crop Simulators</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, bannerImage: "" }))}
                                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Remove Banner
                              </button>
                            </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              {/* Showcase Layout (4:3) */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Showcase Page (4:3 - Drag to Focus)</span>
                                <div 
                                  className="relative aspect-4/3 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm cursor-crosshair select-none touch-none"
                                  onPointerDown={handlePointerDown}
                                  onPointerMove={handlePointerMove}
                                  onPointerUp={handlePointerUp}
                                >
                                  <img
                                    src={formData.bannerImage}
                                    alt="Showcase layout preview"
                                    className="w-full h-full object-cover pointer-events-none"
                                    style={{
                                      objectPosition: `${dialogAdj.x}% ${dialogAdj.y}%`,
                                      transform: `scale(${dialogAdj.scale})`,
                                      transformOrigin: `${dialogAdj.x}% ${dialogAdj.y}%`
                                    }}
                                  />
                                  {/* Reticle Target Overlay */}
                                  <div 
                                    className="absolute w-6 h-6 border-2 border-brand-gold rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.6)] flex items-center justify-center bg-brand-gold/10"
                                    style={{ left: `${dialogAdj.x}%`, top: `${dialogAdj.y}%` }}
                                  >
                                    <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                                  </div>
                                </div>
                              </div>

                              {/* Homepage Arch Layout (3:4) */}
                              <div className="space-y-1.5 flex flex-col items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block self-start">Homepage Card (3:4 Arch)</span>
                                <div className="p-1 border border-brand-gold/25 rounded-t-full bg-white max-w-30 w-full shadow-sm">
                                  <div className="relative aspect-3/4 w-full overflow-hidden rounded-t-full bg-slate-50">
                                    <img
                                      src={formData.bannerImage}
                                      alt="Homepage arch preview"
                                      className="w-full h-full object-cover pointer-events-none"
                                      style={{
                                        objectPosition: `${dialogAdj.x}% ${dialogAdj.y}%`,
                                        transform: `scale(${dialogAdj.scale})`,
                                        transformOrigin: `${dialogAdj.x}% ${dialogAdj.y}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Wide Hero Layout */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Catalog Header Banner (Wide Landscape)</span>
                              <div className="relative h-18 w-full rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
                                <img
                                  src={formData.bannerImage}
                                  alt="Wide catalog hero preview"
                                  className="w-full h-full object-cover pointer-events-none"
                                  style={{
                                    objectPosition: `${dialogAdj.x}% ${dialogAdj.y}%`,
                                    transform: `scale(${dialogAdj.scale})`,
                                    transformOrigin: `${dialogAdj.x}% ${dialogAdj.y}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="w-full aspect-4/3 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-450 bg-white">
                        <ImageIcon className="w-8 h-8 text-slate-350 mb-2" />
                        <span className="text-xs font-medium">No banner image uploaded</span>
                      </div>
                    )}

                    {formData.bannerImage && (
                      (() => {
                        const dialogAdj = parseImageAdjustments(formData.imagePosition);
                        return (
                          <div className="space-y-3.5 mt-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex justify-between items-center">
                              <span>Advanced Image Adjustments</span>
                              <button
                                type="button"
                                onClick={resetImagePosition}
                                className="text-[9px] text-brand-gold hover:underline font-semibold uppercase tracking-wider"
                              >
                                Reset Position
                              </button>
                            </div>

                            {/* Zoom Scale Slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                <Label htmlFor="adj-zoom">Zoom (Scale)</Label>
                                <span className="text-brand-gold font-mono">{dialogAdj.scale.toFixed(2)}x</span>
                              </div>
                              <Input
                                id="adj-zoom"
                                type="range"
                                min="1"
                                max="3"
                                step="0.05"
                                value={dialogAdj.scale}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  imagePosition: `${dialogAdj.x} ${dialogAdj.y} ${e.target.value}`
                                }))}
                                className="h-2 bg-slate-250 accent-brand-gold cursor-pointer p-0"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {/* Horizontal Alignment Focus Slider */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                  <Label htmlFor="adj-x">Horizontal Position</Label>
                                  <span className="text-brand-gold font-mono">{dialogAdj.x}%</span>
                                </div>
                                <Input
                                  id="adj-x"
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={dialogAdj.x}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    imagePosition: `${e.target.value} ${dialogAdj.y} ${dialogAdj.scale}`
                                  }))}
                                  className="h-2 bg-slate-250 accent-brand-gold cursor-pointer p-0"
                                />
                              </div>

                              {/* Vertical Alignment Focus Slider */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                  <Label htmlFor="adj-y">Vertical Position</Label>
                                  <span className="text-brand-gold font-mono">{dialogAdj.y}%</span>
                                </div>
                                <Input
                                  id="adj-y"
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={dialogAdj.y}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    imagePosition: `${dialogAdj.x} ${e.target.value} ${dialogAdj.scale}`
                                  }))}
                                  className="h-2 bg-slate-250 accent-brand-gold cursor-pointer p-0"
                                />
                              </div>
                            </div>

                            <p className="text-[9px] text-slate-405 leading-normal">
                              Fine-tune scale, focal center, and crop coordinates dynamically to align highlight elements accurately across all viewports.
                            </p>
                          </div>
                        );
                      })()
                    )}

                    {/* Drag & Drop File Upload Area */}
                    <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group min-h-22.5">
                      {uploading ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <Loader2 className="w-6 h-6 text-primary animate-spin mb-1" />
                          <span className="text-xs font-semibold text-slate-600">Uploading to Cloudinary...</span>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors mb-1" />
                          <span className="text-xs font-semibold text-slate-600">Upload Image File</span>
                          <span className="text-[9px] text-slate-400">Drag & drop or click</span>
                        </>
                      )}
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

      {/* Manage Products Selection Dialog */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto font-sans p-0 rounded-2xl border-slate-100 shadow-2xl bg-white **:data-[slot=dialog-close]:text-white/80 **:data-[slot=dialog-close]:hover:text-white **:data-[slot=dialog-close]:hover:bg-white/10 **:data-[slot=dialog-close]:top-4 **:data-[slot=dialog-close]:right-4">
          <div className="bg-slate-900 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-800/30 rounded-full blur-xl -mr-16 -mt-16 pointer-events-none" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-secondary uppercase tracking-wide text-white">
                Manage Products: {activeCollectionForProducts?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1">
                Select the products to group inside this collection. Search and toggle items directly.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by name or SKU..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50/50 border-slate-200 text-sm shadow-inner h-9"
              />
            </div>

            <div className="max-h-[52vh] overflow-y-auto border border-slate-100 rounded-xl p-4 bg-slate-50/20">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No products found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((p) => {
                    const isChecked = selectedProductIds.has(p._id);
                    return (
                      <div
                        key={p._id}
                        onClick={() => toggleProductSelection(p._id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isChecked
                            ? 'border-brand-gold bg-brand-gold/5 shadow-2xs'
                            : 'border-slate-200/60 bg-white hover:border-slate-350'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-lg border border-slate-250/20 overflow-hidden bg-white shrink-0">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=100'}
                              alt={p.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider truncate" title={p.name}>{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">SKU: {p.sku}</p>
                            <p className="text-[9px] text-brand-gold font-semibold mt-0.5">{p.metalPurity} {p.metalType}</p>
                          </div>
                        </div>
                        <Switch
                          checked={isChecked}
                          onCheckedChange={() => toggleProductSelection(p._id)}
                          className="data-[state=checked]:bg-brand-gold scale-90 shrink-0 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setIsProductsDialogOpen(false)} className="border-slate-200 hover:bg-slate-50 text-xs rounded-lg h-9">
                Cancel
              </Button>
              <Button
                onClick={handleSaveProductsToCollection}
                disabled={savingProducts}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg h-9"
              >
                {savingProducts ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                  </>
                ) : "Save Products Selection"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
