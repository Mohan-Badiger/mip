"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Eye, User, Edit } from "lucide-react";

export default function BlogsPage() {
  const articles = [
    { title: "The Art of Layering Fine Jewelry", author: "Devika Badiger", status: "Published", views: "1.4k", date: "May 10, 2026", desc: "A detailed guide on coordinating rings, necklaces, and bangles for modern traditional wear." },
    { title: "Understanding Gold Hallmarks & Purity", author: "Mohan Badiger", status: "Published", views: "2.1k", date: "April 24, 2026", desc: "How BIS Hallmarking (916, 750) safeguards your gold investment and certifies metal carat purity." },
    { title: "Diamond Cut, Clarity & Carat Guide", author: "Suresh Gowda", status: "Draft", views: "—", date: "Drafting", desc: "Demystifying the 4Cs of diamond valuation to help customers pick the perfect gemstone." },
    { title: "Top Bridal Jewellery Trends for 2026", author: "Devika Badiger", status: "Published", views: "982", date: "May 18, 2026", desc: "Exploring choker collars, temple artwork necklaces, and emerald combinations trending this season." }
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800 flex items-center gap-2">
            <FileText className="w-8 h-8 text-amber-500" /> Marketing Blogs & News
          </h2>
          <p className="text-sm text-slate-500">
            Publish educational articles, jewelry care tutorials, and marketing releases to engage store visitors.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Add Blog Post
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((art) => (
          <Card key={art.title} className="overflow-hidden border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100/50">
                <div className="flex justify-between items-center">
                  <Badge variant={art.status === "Published" ? "default" : "secondary"} className={art.status === "Published" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500"}>
                    {art.status}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {art.date}</span>
                </div>
                <CardTitle className="text-lg font-secondary uppercase text-slate-800 tracking-wider mt-2">
                  {art.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <p className="text-xs text-slate-500 min-h-[40px] leading-relaxed">
                  {art.desc}
                </p>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-50">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> By {art.author}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {art.views} Views</span>
                </div>
              </CardContent>
            </div>
            <CardContent className="pt-0 border-t border-slate-50 py-3 flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit Article
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
