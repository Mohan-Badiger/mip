"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Trash2, Edit2, Loader2, Sparkles, X, Image as ImageIcon, LayoutGrid, Save, ArrowDown } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Dialog controls
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // null means adding a new product
  
  // Form State
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    slug: "",
    description: "",
    images: "",
    category: "",
    collectionRef: "",
    metalType: "gold",
    metalPurity: "22KT",
    metalWeight: "",
    makingChargeType: "flat_per_gram",
    makingChargeValue: "",
    gemstones: [],
    stock: 1,
    tag: "",
    isActive: true,
    gender: "Women"
  });

  // Gemstone form input
  const [tempGemstone, setTempGemstone] = useState({
    type: "diamond",
    carat: "",
    clarity: "VVS1",
    color: "G",
    cut: "excellent",
    value: ""
  });

  async function fetchProducts(searchQuery = "") {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHelpers() {
    try {
      const [catRes, colRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/collections")
      ]);
      const catJson = await catRes.json();
      const colJson = await colRes.json();
      if (catJson.success) setCategories(catJson.data);
      if (colJson.success) setCollections(colJson.data);
    } catch (e) {
      console.error("Failed to load categories/collections helper lists:", e);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchHelpers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const openAddDialog = () => {
    setCurrentProduct(null);
    setFormData({
      sku: "",
      name: "",
      slug: "",
      description: "",
      images: "",
      category: categories[0]?._id || "",
      collectionRef: "",
      metalType: "gold",
      metalPurity: "22KT",
      metalWeight: "",
      makingChargeType: "flat_per_gram",
      makingChargeValue: "",
      gemstones: [],
      stock: 1,
      tag: "",
      isActive: true,
      gender: "Women"
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setCurrentProduct(product);
    setFormData({
      sku: product.sku || "",
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      images: product.images?.join(", ") || "",
      category: product.category?._id || product.category || "",
      collectionRef: product.collectionRef?._id || product.collectionRef || "",
      metalType: product.metalType || "gold",
      metalPurity: product.metalPurity || "22KT",
      metalWeight: product.metalWeight || "",
      makingChargeType: product.makingChargeType || "flat_per_gram",
      makingChargeValue: product.makingChargeValue || "",
      gemstones: product.gemstones || [],
      stock: product.stock !== undefined ? product.stock : 1,
      tag: product.tag || "",
      isActive: product.isActive !== undefined ? product.isActive : true,
      gender: product.gender || "Women"
    });
    setIsDialogOpen(true);
  };

  const handleAddGemstone = () => {
    if (!tempGemstone.carat || !tempGemstone.value) {
      alert("Please enter both gemstone weight/carat and total value");
      return;
    }
    setFormData(prev => ({
      ...prev,
      gemstones: [...prev.gemstones, {
        ...tempGemstone,
        carat: Number(tempGemstone.carat),
        value: Number(tempGemstone.value)
      }]
    }));
    setTempGemstone({
      type: "diamond",
      carat: "",
      clarity: "VVS1",
      color: "G",
      cut: "excellent",
      value: ""
    });
  };

  const handleRemoveGemstone = (index) => {
    setFormData(prev => ({
      ...prev,
      gemstones: prev.gemstones.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/products";
      const method = currentProduct ? "PUT" : "POST";
      const imagesArray = formData.images
        ? formData.images.split(",").map(img => img.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        images: imagesArray,
        collectionRef: (formData.collectionRef === "none_ref" || !formData.collectionRef) ? null : formData.collectionRef,
        _id: currentProduct?._id
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setIsDialogOpen(false);
        fetchProducts(search);
      } else {
        alert(json.error || "Failed to save product");
      }
    } catch (err) {
      console.error("Save product failed:", err);
      alert("Error occurred while saving product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this product? This will update the client catalog instantly.")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchProducts(search);
      } else {
        alert(json.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Delete product failed:", err);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800">
            Products Catalog
          </h2>
          <p className="text-sm text-slate-500">
            Create, update, and manage your fine jewelry catalog synced directly to the client store.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openAddDialog} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-slate-50/50">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center space-x-2">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by name, SKU or keyword..."
                className="pl-8 bg-white border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700">
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <JewelryLoader size="md" label="Fetching catalog products..." />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed rounded-lg">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-600">No products found</p>
              <p className="text-xs mt-1">Try adding a new product or refining your search parameters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-600">SKU</TableHead>
                  <TableHead className="font-semibold text-slate-600">Product Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Category</TableHead>
                  <TableHead className="font-semibold text-slate-600">Metal Specs</TableHead>
                  <TableHead className="font-semibold text-slate-600">Stock</TableHead>
                  <TableHead className="font-semibold text-slate-600">Gender</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">{product.sku}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="font-medium text-slate-900 truncate">{product.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{product.metalType} {product.metalPurity}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{product.category?.name || "Other"}</TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {product.metalWeight} g ({product.metalPurity})
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {product.gender || "Women"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                        className={product.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button onClick={() => openEditDialog(product)} variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-slate-900">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteProduct(product._id)} variant="ghost" size="icon" className="w-8 h-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto font-sans p-0 rounded-2xl border-slate-100 shadow-2xl bg-white">
          <div className="bg-slate-900/90 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400/25 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-400/30">
                  Premium Inventory Manager
                </span>
              </div>
              <DialogTitle className="text-2xl font-secondary uppercase tracking-wide text-white">
                {currentProduct ? "Edit Product Details" : "Add New Premium Product"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Fill in detailed properties. Pricing calculates dynamically using active market gold and metal rates.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Left Column - General Information */}
              <div className="space-y-6">
                
                {/* Basic Details Group */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-700" /> Basic Information
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="prod-name" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Product Name *</Label>
                      <Input
                        id="prod-name"
                        placeholder="e.g. 22KT Gold Bridal Choker"
                        required
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="prod-sku" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">SKU (Auto-generated if empty)</Label>
                      <Input
                        id="prod-sku"
                        placeholder="e.g. MIP4711"
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prod-desc" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Description *</Label>
                    <Textarea
                      id="prod-desc"
                      placeholder="Product description and craftsmanship details..."
                      required
                      rows={3}
                      className="bg-white border-slate-200 text-sm leading-relaxed shadow-sm resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Media Assets Group */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-700" /> Media & Images
                  </h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="prod-images" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Images URLs (Comma separated)</Label>
                    <Input
                      id="prod-images"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      className="bg-white border-slate-200 text-xs font-mono shadow-sm"
                      value={formData.images}
                      onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                    />
                    <span className="text-[10px] text-slate-400 font-medium block">
                      * First image will serve as the primary catalog display thumbnail.
                    </span>
                  </div>
                </div>

                {/* Categorization & Metadata Group */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-slate-700" /> Categorization & Inventory
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Collection</Label>
                      <Select
                        value={formData.collectionRef}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, collectionRef: val }))}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue placeholder="No Collection" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none_ref">No Collection</SelectItem>
                          {collections.map((col) => (
                            <SelectItem key={col._id} value={col._id}>
                              {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Gender *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Women">Women</SelectItem>
                          <SelectItem value="Men">Men</SelectItem>
                          <SelectItem value="Kids">Kids</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="prod-stock" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Stock Quantity *</Label>
                      <Input
                        id="prod-stock"
                        type="number"
                        required
                        min={0}
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Toggle Switch */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-active" className="text-sm font-semibold text-slate-800">Live Status</Label>
                    <p className="text-xs text-slate-400">Make product instantly visible to client portal buyers</p>
                  </div>
                  <Switch
                    id="is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

              </div>

              {/* Right Column - Specifications, Making charges & Gemstones */}
              <div className="space-y-6">
                
                {/* Metal Specifications */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Save className="w-4 h-4 text-slate-700" /> Metal Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Metal Type *</Label>
                      <Select
                        value={formData.metalType}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, metalType: val }))}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Metal Purity *</Label>
                      <Select
                        value={formData.metalPurity}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, metalPurity: val }))}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18KT">18KT Gold</SelectItem>
                          <SelectItem value="22KT">22KT Gold</SelectItem>
                          <SelectItem value="24KT">24KT Gold</SelectItem>
                          <SelectItem value="950PT">950PT Platinum/Silver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="prod-weight" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Metal Weight (g) *</Label>
                      <Input
                        id="prod-weight"
                        type="number"
                        step="0.001"
                        required
                        placeholder="e.g. 14.250"
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.metalWeight}
                        onChange={(e) => setFormData(prev => ({ ...prev, metalWeight: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="prod-tag" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Custom Tags/Badge</Label>
                      <Input
                        id="prod-tag"
                        placeholder="e.g. Best Seller"
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.tag}
                        onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Making Charges */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-slate-700" /> Making Charges
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Calculation Mode *</Label>
                      <Select
                        value={formData.makingChargeType}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, makingChargeType: val }))}
                      >
                        <SelectTrigger className="bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">% of Gold Value</SelectItem>
                          <SelectItem value="flat_per_gram">Flat Rate (₹ / gram)</SelectItem>
                          <SelectItem value="flat_total">Flat Total Sum (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="making-val" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Charge Value *</Label>
                      <Input
                        id="making-val"
                        type="number"
                        step="0.01"
                        required
                        placeholder="e.g. 12 or 450"
                        className="bg-white border-slate-200 text-sm shadow-sm"
                        value={formData.makingChargeValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, makingChargeValue: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Gemstones Details */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-slate-700" /> Gemstone Inlays
                  </h4>
                  
                  {/* Gemstones List */}
                  {formData.gemstones.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                        Added Gemstones ({formData.gemstones.length})
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {formData.gemstones.map((gem, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 font-bold uppercase text-[10px] shrink-0">
                                {gem.type[0]}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 capitalize text-xs truncate">{gem.type}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                                  {gem.carat} ct • {gem.color || "N/A"} / {gem.clarity || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-slate-800">₹{gem.value.toLocaleString("en-IN")}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full"
                                onClick={() => handleRemoveGemstone(i)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gemstone Adding Sub-form */}
                  <div className="bg-white p-4 border border-slate-100 rounded-xl space-y-3.5 shadow-sm">
                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mb-1">
                      Add Custom Gemstone
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-500 uppercase">Stone Type</Label>
                        <Select
                          value={tempGemstone.type}
                          onValueChange={(val) => setTempGemstone(prev => ({ ...prev, type: val }))}
                        >
                          <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diamond">Diamond</SelectItem>
                            <SelectItem value="ruby">Ruby</SelectItem>
                            <SelectItem value="emerald">Emerald</SelectItem>
                            <SelectItem value="sapphire">Sapphire</SelectItem>
                            <SelectItem value="pearl">Pearl</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-500 uppercase">Weight (Weight/Ct)</Label>
                        <Input
                          className="h-8 text-xs bg-slate-50 border-slate-200"
                          type="number"
                          step="0.01"
                          placeholder="e.g. 0.25"
                          value={tempGemstone.carat}
                          onChange={(e) => setTempGemstone(prev => ({ ...prev, carat: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-500 uppercase">Clarity</Label>
                        <Select
                          value={tempGemstone.clarity}
                          onValueChange={(val) => setTempGemstone(prev => ({ ...prev, clarity: val }))}
                        >
                          <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IF">IF</SelectItem>
                            <SelectItem value="VVS1">VVS1</SelectItem>
                            <SelectItem value="VVS2">VVS2</SelectItem>
                            <SelectItem value="VS1">VS1</SelectItem>
                            <SelectItem value="VS2">VS2</SelectItem>
                            <SelectItem value="SI1">SI1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-500 uppercase">Color Grade</Label>
                        <Select
                          value={tempGemstone.color}
                          onValueChange={(val) => setTempGemstone(prev => ({ ...prev, color: val }))}
                        >
                          <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D">D (Colorless)</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                            <SelectItem value="G">G (Near Colorless)</SelectItem>
                            <SelectItem value="H">H</SelectItem>
                            <SelectItem value="Fancy">Fancy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-500 uppercase">Est. Value (₹)</Label>
                        <Input
                          className="h-8 text-xs bg-slate-50 border-slate-200"
                          type="number"
                          placeholder="e.g. 12000"
                          value={tempGemstone.value}
                          onChange={(e) => setTempGemstone(prev => ({ ...prev, value: e.target.value }))}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddGemstone}
                          className="h-8 w-full bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold"
                        >
                          Add Stone
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-200 hover:bg-slate-50">
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md">
                {currentProduct ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
