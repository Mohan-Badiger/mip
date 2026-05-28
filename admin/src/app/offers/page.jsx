"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Gift, Sparkles, Copy, Calendar, BarChart2, Trash2, Edit3, X, Loader2, AlertCircle, Check } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";

export default function OffersPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [selectedId, setSelectedId] = useState(null);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minCartValue, setMinCartValue] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  async function fetchCoupons() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/offers");
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data);
      } else {
        setError(json.error || "Failed to load coupons.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading coupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedId(null);
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinCartValue("");
    setDescription("");
    setFirstTimeOnly(false);
    // Set default expiry date to 30 days from now
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setExpiryDate(nextMonth.toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setModalMode("edit");
    setSelectedId(coupon._id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinCartValue(coupon.minCartValue.toString());
    setDescription(coupon.description || "");
    setExpiryDate(new Date(coupon.expiryDate).toISOString().split("T")[0]);
    setFirstTimeOnly(coupon.firstTimeOnly || false);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch("/api/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, isActive: !currentStatus })
      });
      const json = await res.json();
      if (json.success) {
        setCoupons(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        showFeedback("Coupon status updated successfully.");
      } else {
        setError(json.error || "Failed to update coupon status.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/offers?id=${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setCoupons(prev => prev.filter(c => c._id !== id));
        showFeedback("Coupon deleted successfully.");
      } else {
        setError(json.error || "Failed to delete coupon.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete coupon.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountType || !discountValue || !expiryDate) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      code,
      discountType,
      discountValue: Number(discountValue),
      minCartValue: Number(minCartValue) || 0,
      description,
      expiryDate,
      firstTimeOnly
    };

    if (modalMode === "edit") {
      payload._id = selectedId;
    }

    try {
      const res = await fetch("/api/offers", {
        method: modalMode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchCoupons();
        showFeedback(modalMode === "edit" ? "Coupon updated successfully." : "Coupon created successfully.");
      } else {
        setError(json.error || "Failed to save coupon.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error saving coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const showFeedback = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const formatDiscountLabel = (type, val) => {
    if (type === "percentage") return `${val}% OFF`;
    if (type === "flat") return `₹${val} OFF`;
    if (type === "free-making") return "Making Charges Free";
    return `${val} OFF`;
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800 flex items-center gap-2">
            <Gift className="w-8 h-8 text-amber-500" /> Offers & Promotions
          </h2>
          <p className="text-sm text-slate-500">
            Design discount campaigns, configure coupon codes, and track customer redemption levels.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateModal} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Create Coupon
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 text-xs border border-green-150 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg animate-fadeIn">
          <Sparkles className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs border border-rose-100 bg-rose-50 text-rose-700 px-4 py-2.5 rounded-lg animate-fadeIn">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <JewelryLoader size="md" label="Loading offers catalog..." />
        </div>
      ) : coupons.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200">
          <Gift className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-lg text-slate-700">No active offers</h3>
          <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
            Get started by creating your first promotional coupon code for customers.
          </p>
          <Button onClick={openCreateModal} className="bg-slate-900 text-white hover:bg-slate-800">
            Create Coupon
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => {
            const isExpired = new Date(c.expiryDate) < new Date();
            const formattedExpiry = new Date(c.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <Card key={c._id} className="overflow-hidden border-slate-100 hover:shadow-md transition-all duration-300">
                <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100/50">
                  <div className="flex justify-between items-center">
                    <Badge variant={c.isActive && !isExpired ? "default" : "secondary"} className={c.isActive && !isExpired ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" : "bg-slate-100 text-slate-500 hover:bg-slate-100"}>
                      {isExpired ? "Expired" : c.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.discountType.replace("-", " ")}</span>
                  </div>
                  <CardTitle className="text-2xl font-mono font-bold text-slate-800 tracking-wider flex items-center justify-between mt-2">
                    {c.code}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => handleCopy(c.code)}>
                        {copiedCode === c.code ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm font-semibold text-indigo-650 mt-1">
                    {formatDiscountLabel(c.discountType, c.discountValue)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-xs text-slate-500 min-h-8">{c.description || "No description provided."}</p>

                  <div className="flex gap-2">
                    {c.minCartValue > 0 && (
                      <div className="text-[10px] text-indigo-700 font-semibold bg-indigo-50/40 px-2 py-1 rounded w-fit">
                        Min. Cart: ₹{c.minCartValue}
                      </div>
                    )}
                    {c.firstTimeOnly && (
                      <div className="text-[10px] text-amber-700 font-semibold bg-amber-50/60 px-2 py-1 rounded w-fit">
                        First Order Only
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-450 pt-3 border-t border-slate-50">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Exp: {formattedExpiry}</span>
                    <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Redemptions: {c.usageCount}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center space-x-2">
                      <Switch id={`active-${c._id}`} checked={c.isActive} onCheckedChange={() => handleToggleActive(c._id, c.isActive)} />
                      <Label htmlFor={`active-${c._id}`} className="text-xs text-slate-500 cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => openEditModal(c)}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(c._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card onClick={openCreateModal} className="flex flex-col items-center justify-center min-h-55 border-dashed border-2 border-slate-200 bg-slate-50/30 hover:bg-slate-50/70 cursor-pointer transition-all duration-300">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border">
                <Plus className="w-5 h-5 text-slate-600" />
              </div>
              <span className="font-semibold text-sm text-slate-650">New Campaign Code</span>
              <span className="text-xs text-slate-400">Set percentages, offsets, or freebies</span>
            </div>
          </Card>
        </div>
      )}

      {/* CREATE & EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md border border-slate-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-secondary uppercase font-bold text-slate-800 text-base">
                {modalMode === "edit" ? "Modify Coupon Code" : "Create Promotional Coupon"}
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-450 hover:text-slate-700" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-code">Coupon Code *</Label>
                <Input
                  id="coupon-code"
                  type="text"
                  required
                  placeholder="e.g. WELCOME10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  disabled={modalMode === "edit"}
                  className="bg-white uppercase font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-type">Discount Type *</Label>
                  <select
                    id="coupon-type"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full text-xs h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="percentage">Percentage OFF</option>
                    <option value="flat">Flat Value (₹)</option>
                    <option value="free-making">Free Making Charges</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coupon-val">Discount Value *</Label>
                  <Input
                    id="coupon-val"
                    type="number"
                    required
                    min={0}
                    placeholder={discountType === "percentage" ? "10" : "500"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    disabled={discountType === "free-making"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="coupon-min">Min Cart Value (₹)</Label>
                  <Input
                    id="coupon-min"
                    type="number"
                    min={0}
                    placeholder="e.g. 1000"
                    value={minCartValue}
                    onChange={(e) => setMinCartValue(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coupon-expiry">Expiry Date *</Label>
                  <Input
                    id="coupon-expiry"
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coupon-desc">Description</Label>
                <textarea
                  id="coupon-desc"
                  rows={2}
                  placeholder="e.g. 10% off on first checkout for new signups"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-1">
                <Switch id="coupon-first-only" checked={firstTimeOnly} onCheckedChange={setFirstTimeOnly} />
                <Label htmlFor="coupon-first-only" className="text-xs font-medium text-slate-700 cursor-pointer">
                  First-time Order Only
                </Label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-350 hover:bg-slate-50 text-slate-700">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {modalMode === "edit" ? "Save Coupon" : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
