"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MessageSquare,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  Search,
  Sparkles,
  User,
  Trash2,
} from "lucide-react";

// Mock reviews database representing premium luxury products
const INITIAL_REVIEWS = [
  {
    id: "REV-101",
    author: "Aishwarya R.",
    email: "aishwarya.r@gmail.com",
    rating: 5,
    product: "22KT Bridal Gold Choker Set",
    date: "May 14, 2026",
    text: "Absolutely stunning design! The hallmark certification was verified and the billing was highly transparent according to live rates. The packaging felt extremely luxurious.",
    approved: true,
    hidden: false
  },
  {
    id: "REV-102",
    author: "Vikram S.",
    email: "vikram.singh@outlook.com",
    rating: 5,
    product: "Signature Platinum Ring",
    date: "May 10, 2026",
    text: "Excellent craftsmanship. The diamond sparkles beautifully and has great fire under lighting. Will definitely purchase again.",
    approved: true,
    hidden: false
  },
  {
    id: "REV-103",
    author: "Nalini Gowda",
    email: "nalini.gowda@gmail.com",
    rating: 4,
    product: "Anti-tarnish Silver Bracelet",
    date: "May 12, 2026",
    text: "Beautiful piece of jewellery, although delivery was delayed by a day. Customer service kept me informed and the bracelet quality is superb.",
    approved: false,
    hidden: false
  },
  {
    id: "REV-104",
    author: "Priya M.",
    email: "priya.m@gmail.com",
    rating: 5,
    product: "Antique Temple Earrings",
    date: "May 18, 2026",
    text: "The earrings look exactly as shown in the images. Exquisite finish and lightweight to wear. Fits my bridal look perfectly.",
    approved: true,
    hidden: false
  },
  {
    id: "REV-105",
    author: "Siddharth K.",
    email: "sid.k@yahoo.com",
    rating: 3,
    product: "Mens Gold Kada 24KT",
    date: "May 08, 2026",
    text: "The design is very traditional and heavy. However, the clasp is a bit tight and takes effort to open. Hope it loosens up with use.",
    approved: false,
    hidden: false
  }
];

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, APPROVED, HIDDEN
  const [ratingFilter, setRatingFilter] = useState(0); // 0 means all stars

  // Calculate review stats
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter(r => r.approved && !r.hidden).length;
  const pendingCount = reviews.filter(r => !r.approved && !r.hidden).length;
  const avgRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1);

  // Status transitions
  const handleApprove = (id) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, approved: true, hidden: false } : r))
    );
  };

  const handleReject = (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleHide = (id) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, hidden: !r.hidden } : r))
    );
  };

  const getRatingStats = (stars) => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { count, percentage };
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      r.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.text.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === 0 || r.rating === ratingFilter;

    let matchesStatus = true;
    if (statusFilter === "PENDING") matchesStatus = !r.approved && !r.hidden;
    else if (statusFilter === "APPROVED") matchesStatus = r.approved && !r.hidden;
    else if (statusFilter === "HIDDEN") matchesStatus = r.hidden;

    return matchesSearch && matchesRating && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] font-semibold uppercase">
            Product Reviews & Moderation
          </h1>
          <p className="text-xs text-muted-foreground">
            Approve, archive, or moderate testimonials and client reviews shown on front-end catalog details.
          </p>
        </div>
      </div>

      {/* Review Analytics and Ratings Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Overall Rating Card */}
        <Card className="border-[#DED8D0] bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-heading">Average Rating</span>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold font-heading text-[#1A1A1A]">{avgRating}</span>
              <span className="text-sm text-muted-foreground">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-2.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(parseFloat(avgRating))
                      ? "fill-[#B39254] text-[#B39254]"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Calculated across {totalReviews} total submitted customer reviews.
            </p>
          </CardContent>
        </Card>

        {/* Rating Breakdown Card */}
        <Card className="border-[#DED8D0] bg-white shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-heading uppercase tracking-wider text-[#1A1A1A]">Star Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const { count, percentage } = getRatingStats(stars);
              return (
                <div key={stars} className="flex items-center gap-4 text-xs">
                  <span className="w-12 font-semibold text-slate-700 flex items-center gap-0.5 justify-end">
                    {stars} <Star className="w-3.5 h-3.5 fill-[#B39254] text-[#B39254]" />
                  </span>
                  <div className="flex-1 h-2 bg-[#FAF8F5] border border-[#DED8D0]/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B39254] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground font-mono">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Toolbar */}
      <Card className="border-[#DED8D0] bg-white shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, product, comment contents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#DED8D0] p-1 rounded-md">
                {[
                  { value: "ALL", label: "All" },
                  { value: "PENDING", label: `Pending (${pendingCount})` },
                  { value: "APPROVED", label: "Approved" },
                  { value: "HIDDEN", label: "Archived" }
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant="ghost"
                    className={`h-7 px-3 text-[10px] uppercase tracking-wider rounded shadow-none
                      ${statusFilter === opt.value 
                        ? "bg-white border border-[#DED8D0] text-[#1A1A1A] font-semibold"
                        : "text-muted-foreground hover:text-[#1A1A1A] hover:bg-muted/40"}`}
                    onClick={() => setStatusFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="h-9 text-xs bg-white border border-[#DED8D0] rounded-md px-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-slate-800"
              >
                <option value={0}>All Stars</option>
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredReviews.length === 0 ? (
          <div className="col-span-2 text-center py-20 bg-white border border-dashed border-[#DED8D0] rounded-lg text-muted-foreground text-xs font-mono">
            No customer reviews found matching the selected filters.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <Card
              key={rev.id}
              className={`overflow-hidden transition-all duration-300 flex flex-col justify-between bg-white border
                ${rev.hidden 
                  ? "border-[#DED8D0]/60 opacity-60 bg-[#FAF8F5]/30 border-dashed" 
                  : "border-[#DED8D0] hover:shadow-sm"}`}
            >
              <div>
                <CardHeader className="bg-[#FAF8F5]/60 pb-3 border-b border-[#DED8D0]/50">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#DED8D0] flex items-center justify-center text-[#B39254] font-semibold text-xs font-heading">
                        {rev.author.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                          {rev.author}
                          <span className="text-[9px] text-muted-foreground font-normal font-mono">• {rev.date}</span>
                        </CardTitle>
                        <span className="text-[9px] text-muted-foreground block lowercase">{rev.email}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < rev.rating
                                ? "fill-[#B39254] text-[#B39254]"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      
                      {rev.hidden ? (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] uppercase tracking-wider">
                          Archived
                        </Badge>
                      ) : rev.approved ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] uppercase tracking-wider">
                          Approved & Live
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] uppercase tracking-wider">
                          Pending Moderation
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[9px] uppercase tracking-widest text-[#B39254] font-semibold">Reviewed Product:</span>
                    <span className="text-xs text-[#1A1A1A] block font-medium font-heading">{rev.product}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-6">
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </CardContent>
              </div>

              {/* Action Toolbar */}
              <CardContent className="pt-0 border-t border-[#DED8D0]/60 py-3 flex justify-between items-center bg-[#FAF8F5]/30">
                <span className="text-[9px] text-muted-foreground font-mono">ID: {rev.id}</span>
                <div className="flex items-center gap-2">
                  {!rev.approved && !rev.hidden && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(rev.id)}
                        className="h-8 bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-[10px] uppercase tracking-wider flex items-center gap-1 px-4 shadow-none"
                      >
                        <Check className="w-3 h-3 text-[#B39254]" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(rev.id)}
                        className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-[#DED8D0] text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-none"
                      >
                        <X className="w-3 h-3" /> Reject
                      </Button>
                    </>
                  )}

                  {(rev.approved || rev.hidden) && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleHide(rev.id)}
                        className="h-8 text-slate-600 hover:text-[#1A1A1A] hover:bg-slate-100 text-[10px] uppercase tracking-wider flex items-center gap-1"
                      >
                        {rev.hidden ? (
                          <>
                            <Eye className="w-3 h-3 text-primary" /> Unarchive
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-muted-foreground" /> Archive Review
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(rev.id)}
                        className="h-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
