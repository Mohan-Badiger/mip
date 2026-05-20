"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Image as ImageIcon, Video, Plus, Save } from "lucide-react";

export default function CMSPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Homepage CMS</h2>
          <p className="text-muted-foreground">Manage the content and layout of your store&apos;s homepage.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Preview</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Publish Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Sections Layout</TabsTrigger>
          <TabsTrigger value="hero">Hero Banners</TabsTrigger>
          <TabsTrigger value="seo">Homepage SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sections</CardTitle>
              <CardDescription>Drag and drop to reorder the sections on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "hero", name: "Hero Slider", type: "Banner" },
                { id: "categories", name: "Shop By Category", type: "Grid" },
                { id: "bridal", name: "Bridal Collection Banner", type: "Banner" },
                { id: "trending", name: "Trending Products", type: "Carousel" },
                { id: "video", name: "Campaign Video", type: "Video" },
                { id: "instagram", name: "Instagram Gallery", type: "Grid" },
              ].map((section) => (
                <div key={section.id} className="flex items-center space-x-4 border rounded-lg p-4 bg-white">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div className="flex-1">
                    <p className="font-medium">{section.name}</p>
                    <p className="text-xs text-muted-foreground">{section.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Slider Banners</CardTitle>
              <CardDescription>Manage the main sliding banners at the top of the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    <div className="w-40 h-24 bg-zinc-200 rounded flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-zinc-400" />
                    </div>
                    <div className="space-y-2">
                      <Label>Banner 1: Diwali Offer</Label>
                      <Input defaultValue="https://res.cloudinary.com/mip/diwali-banner-2024.jpg" className="w-[400px]" />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                </div>
              </div>
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="mr-2 h-4 w-4" /> Add Banner
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Metadata</CardTitle>
              <CardDescription>Optimize your store for search engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input id="seo-title" defaultValue="MIP Jewellers | Premium Gold & Diamond Collections" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-desc">Meta Description</Label>
                <Input id="seo-desc" defaultValue="Discover our exclusive collection of 22K gold, diamond, and platinum jewellery. Shop online or visit our stores." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
