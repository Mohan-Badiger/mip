"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Settings } from "lucide-react";

const collections = [
  { id: "COL001", name: "Bridal Elegance 2024", products: 45, status: "Active", type: "Campaign" },
  { id: "COL002", name: "Temple Jewellery", products: 120, status: "Active", type: "Category" },
  { id: "COL003", name: "Office Wear Minimalist", products: 65, status: "Active", type: "Theme" },
  { id: "COL004", name: "Diwali Special Offers", products: 30, status: "Draft", type: "Campaign" },
];

export default function CollectionsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">Manage your product collections, themes, and campaigns.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Collection
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-all">
            <div className="h-32 bg-muted flex items-center justify-center relative">
              <ImageIcon className="h-10 w-10 text-muted-foreground opacity-50" />
              <Badge className="absolute top-2 right-2" variant={collection.status === "Active" ? "default" : "secondary"}>
                {collection.status}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{collection.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{collection.products} Products</span>
                <span>{collection.type}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" /> Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="flex flex-col items-center justify-center h-full min-h-[280px] border-dashed border-2 bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium text-lg">New Collection</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
