"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Settings, Loader2, Sparkles } from "lucide-react";
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
                      <img 
                         src={collection.bannerImage} 
                         alt={collection.name} 
                         className="w-full h-full object-cover"
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
            className="flex flex-col items-center justify-center h-full min-h-[250px] border-dashed border-2 border-slate-200 bg-slate-50/30 hover:bg-slate-50/70 hover:border-slate-300 cursor-pointer transition-all duration-300"
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

      {/* Collection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-secondary uppercase text-slate-800">
              {selectedCollection ? "Edit Collection" : "Create New Collection"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {selectedCollection 
                ? "Update details or permanently delete this collection tag."
                : "This will add a new collection tag usable for product listings and frontpage carousels."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCollection} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="col-name">Collection Name *</Label>
              <Input
                id="col-name"
                placeholder="e.g. Royal Antique Collection"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="col-desc">Description</Label>
              <Textarea
                id="col-desc"
                placeholder="Short pitch or summary for customers..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="col-image">Banner Image URL</Label>
              <Input
                id="col-image"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.bannerImage}
                onChange={(e) => setFormData(prev => ({ ...prev, bannerImage: e.target.value }))}
              />
            </div>

            <DialogFooter className="gap-2 flex justify-between items-center">
              {selectedCollection && (
                <Button type="button" variant="destructive" onClick={handleDeleteCollection} className="bg-rose-600 hover:bg-rose-700 text-white mr-auto">
                  Delete
                </Button>
              )}
              <div className="flex gap-2 justify-end ml-auto">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  {selectedCollection ? "Save Changes" : "Create Collection"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
