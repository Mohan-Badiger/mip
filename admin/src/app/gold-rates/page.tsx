"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, RefreshCw } from "lucide-react";

export default function GoldRatesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gold Rate Management</h2>
          <p className="text-muted-foreground">Manage daily gold, silver, and platinum rates for pricing engine.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Sync via API
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Save Rates
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Rates (per gram)</CardTitle>
            <CardDescription>Update the base metal prices manually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate-22k">22K Gold (₹)</Label>
              <Input id="rate-22k" type="number" defaultValue="6500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-24k">24K Gold (₹)</Label>
              <Input id="rate-24k" type="number" defaultValue="7090" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-18k">18K Gold (₹)</Label>
              <Input id="rate-18k" type="number" defaultValue="5318" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-silver">Silver (₹)</Label>
              <Input id="rate-silver" type="number" defaultValue="82" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings & Automation</CardTitle>
            <CardDescription>Configure how rates are applied to products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label>Auto-update Rates</Label>
                <span className="text-sm text-muted-foreground">Automatically fetch rates from MCX at 10 AM daily.</span>
              </div>
              <Switch id="auto-sync" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label>Live Price Banner</Label>
                <span className="text-sm text-muted-foreground">Show the live gold rate banner on the frontend header.</span>
              </div>
              <Switch id="show-banner" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label>Apply to Pricing Engine</Label>
                <span className="text-sm text-muted-foreground">Automatically recalculate all product prices when rates change.</span>
              </div>
              <Switch id="auto-calc" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
