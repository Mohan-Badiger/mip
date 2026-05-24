"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Settings, Loader2, Sparkles, Search, Edit2, Trash2 } from "lucide-react";
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
                  <TableHead className="font-semibold text-slate-600 w-[80px]">Cover</TableHead>
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

      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-secondary uppercase text-slate-800">
              {selectedCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Categories organize jewellery catalog pages on the client-side.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Earrings"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Description of the category style..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-image">Cover Image URL</Label>
              <Input
                id="cat-image"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                {selectedCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
