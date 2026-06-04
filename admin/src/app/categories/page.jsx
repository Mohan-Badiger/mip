"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Settings, Loader2, Sparkles, Search, Edit2, Trash2, UploadCloud, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // null means creating
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: ""
  });

  const [uploading, setUploading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products")
      ]);
      const catJson = await catRes.json();
      const prodJson = await prodRes.json();
      if (catJson.success) setCategories(catJson.data);
      if (prodJson.success) setProducts(prodJson.data);
    } catch (err) {
      console.error("Failed to load categories page data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDialog = () => {
    setSelectedCategory(null);
    setFormData({ name: "", description: "", image: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      image: category.image || ""
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          image: data.url
        }));
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      const url = "/api/categories";
      const method = selectedCategory ? "PUT" : "POST";
      const payload = selectedCategory
        ? { ...formData, _id: selectedCategory._id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setIsDialogOpen(false);
        setFormData({ name: "", description: "", image: "" });
        loadData();
      } else {
        alert(json.error || "Failed to save category");
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      alert("Error occurred while saving category.");
    }
  };

  const handleDeleteCategory = async (category) => {
    const count = getProductCount(category._id);
    if (count > 0) {
      alert(`Cannot delete category: "${category.name}" has ${count} associated products. Please move or delete the products first.`);
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete category "${category.name}"?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${category._id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        loadData();
      } else {
        alert(json.error || "Failed to delete category");
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert("Error occurred while deleting category.");
    }
  };

  const getProductCount = (catId) => {
    return products.filter(p => p.category?._id === catId || p.category === catId).length;
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800">
            Categories Directory
          </h2>
          <p className="text-sm text-slate-500">
            Define fine jewellery classifications like Rings, Necklaces, Bracelets, and Earrings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8 bg-white border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <JewelryLoader size="md" label="Fetching store categories..." />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed rounded-lg">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-600">No categories found</p>
              <p className="text-xs mt-1">Try creating a new jewellery category tag.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-600 w-20">Cover</TableHead>
                  <TableHead className="font-semibold text-slate-600">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Slug</TableHead>
                  <TableHead className="font-semibold text-slate-600">Description</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center">Products Count</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => {
                  const count = getProductCount(category._id);
                  return (
                    <TableRow key={category._id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100 relative">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 font-secondary tracking-wider uppercase">
                        {category.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{category.slug}</TableCell>
                      <TableCell className="text-slate-500 max-w-xs truncate text-xs">
                        {category.description || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {count} products
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button onClick={() => openEditDialog(category)} variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-slate-900">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDeleteCategory(category)} variant="ghost" size="icon" className="w-8 h-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto font-sans p-0 rounded-2xl border-slate-100 shadow-2xl bg-white **:data-[slot=dialog-close]:text-white/80 **:data-[slot=dialog-close]:hover:text-white **:data-[slot=dialog-close]:hover:bg-white/10 **:data-[slot=dialog-close]:top-4 **:data-[slot=dialog-close]:right-4">
          <div className="bg-slate-900/90 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400/25 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-400/30">
                  Premium Category Manager
                </span>
              </div>
              <DialogTitle className="text-2xl font-secondary uppercase tracking-wide text-white">
                {selectedCategory ? "Edit Category Details" : "Create New Jewellery Category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Configure category metadata, descriptions, and banner display imagery synced directly to the client catalog.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: Basic Details */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-700" /> Category Details
                  </h4>

                  <div className="space-y-4 pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="cat-name" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Category Name *</Label>
                      <Input
                        id="cat-name"
                        placeholder="e.g. Earrings"
                        required
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cat-desc" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Description</Label>
                      <Textarea
                        id="cat-desc"
                        placeholder="Description of the category style, collections, and aesthetic appeal..."
                        rows={5}
                        className="bg-white border-slate-200 text-sm leading-relaxed shadow-sm resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-slate-400 font-medium block mt-4">
                  * Categories organize jewellery catalog items, grouping them for customer filtering.
                </span>
              </div>

              {/* Right Column: Imagery */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-700" /> Category Banner Image
                  </h4>

                  <div className="pt-3 space-y-4">
                    {/* Image Preview Thumbnail */}
                    {formData.image ? (
                      <div className="relative w-full aspect-video rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm group">
                        <img src={formData.image} alt="Category Banner preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
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
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      {uploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-1" />
                          <span className="text-xs font-semibold text-slate-600">Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors mb-1" />
                          <span className="text-xs font-semibold text-slate-600">Upload Image File</span>
                          <span className="text-[9px] text-slate-400">Drag & drop or click</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[9px] text-slate-400 font-medium block mt-4">
                  * Visual graphics make catalogue navigation intuitive and premium on storefront listings.
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-200 hover:bg-slate-50 text-xs rounded-lg h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg h-9">
                {selectedCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
