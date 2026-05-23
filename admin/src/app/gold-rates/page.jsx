"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, RefreshCw, Loader2, Sparkles, AlertCircle } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";

export default function GoldRatesPage() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Metal Rates form state
  const [gold24k, setGold24k] = useState(7850);
  const [gold22k, setGold22k] = useState(7200);
  const [gold18k, setGold18k] = useState(6000);
  const [silver, setSilver] = useState(95);
  const [platinum, setPlatinum] = useState(3200);

  async function fetchRates() {
    try {
      setLoading(true);
      const res = await fetch("/api/gold-rates");
      const json = await res.json();
      if (json.success) {
        setRates(json.data);
        // Map individual states
        json.data.forEach(r => {
          if (r.metal === "gold") {
            if (r.purity === "24KT") setGold24k(r.pricePerGram);
            if (r.purity === "22KT") setGold22k(r.pricePerGram);
            if (r.purity === "18KT") setGold18k(r.pricePerGram);
          } else if (r.metal === "silver") {
            setSilver(r.pricePerGram);
          } else if (r.metal === "platinum") {
            setPlatinum(r.pricePerGram);
          }
        });
      }
    } catch (e) {
      console.error("Failed to load rates:", e);
      setError("Failed to retrieve current metal rates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSaveRates = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      const payload = {
        rates: [
          { metal: "gold", purity: "24KT", pricePerGram: gold24k },
          { metal: "gold", purity: "22KT", pricePerGram: gold22k },
          { metal: "gold", purity: "18KT", pricePerGram: gold18k },
          { metal: "silver", purity: "950PT", pricePerGram: silver },
          { metal: "platinum", purity: "950PT", pricePerGram: platinum }
        ]
      };

      const res = await fetch("/api/gold-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error || "Failed to update rates.");
      }
    } catch (err) {
      console.error("Failed to save rates:", err);
      setError("Network error occurred while saving rates.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncAPI = async () => {
    try {
      setLoading(true);
      // Wait for a second to show loading feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      // Call client's route to refresh if available or reload
      const res = await fetch("/api/gold-rates");
      const json = await res.json();
      if (json.success) {
        fetchRates();
      }
    } catch (e) {
      console.error("Sync API failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800">
            Gold Rate Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage daily gold, silver, and platinum rates per gram for pricing calculations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSyncAPI} variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-700">
            <RefreshCw className="mr-2 h-4 w-4" /> Sync via API
          </Button>
          <Button onClick={handleSaveRates} disabled={saving} className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Rates
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs border border-rose-100 bg-rose-50 text-rose-700 px-4 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs border border-green-100 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg">
          <Sparkles className="w-4 h-4" />
          <span>Gold and precious metal rates updated successfully! Synced with pricing engine.</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <JewelryLoader size="md" label="Fetching daily metal market rates..." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="font-secondary uppercase text-slate-800 tracking-wider text-base">Current Rates (per gram)</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Update the base metal prices in Indian Rupees (₹) manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rate-24k">24K Pure Gold (₹)</Label>
                <Input 
                  id="rate-24k" 
                  type="number" 
                  value={gold24k} 
                  onChange={(e) => setGold24k(e.target.value)} 
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate-22k">22K Standard Gold (₹)</Label>
                <Input 
                  id="rate-22k" 
                  type="number" 
                  value={gold22k} 
                  onChange={(e) => setGold22k(e.target.value)} 
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate-18k">18K Gold (₹)</Label>
                <Input 
                  id="rate-18k" 
                  type="number" 
                  value={gold18k} 
                  onChange={(e) => setGold18k(e.target.value)} 
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate-silver">Silver 950PT (₹)</Label>
                <Input 
                  id="rate-silver" 
                  type="number" 
                  value={silver} 
                  onChange={(e) => setSilver(e.target.value)} 
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate-plat">Platinum 950PT (₹)</Label>
                <Input 
                  id="rate-plat" 
                  type="number" 
                  value={platinum} 
                  onChange={(e) => setPlatinum(e.target.value)} 
                  className="bg-white border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="font-secondary uppercase text-slate-800 tracking-wider text-base">Settings & Automation</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Configure how rates are applied to products.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm text-slate-800 font-semibold">Auto-update Rates</Label>
                  <span className="text-xs text-slate-400">
                    Automatically fetch rates from MCX at 10 AM daily.
                  </span>
                </div>
                <Switch id="auto-sync" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm text-slate-800 font-semibold">Live Price Banner</Label>
                  <span className="text-xs text-slate-400">
                    Show the live gold rate banner on the frontend header.
                  </span>
                </div>
                <Switch id="show-banner" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label className="text-sm text-slate-800 font-semibold">Apply to Pricing Engine</Label>
                  <span className="text-xs text-slate-400">
                    Automatically recalculate all product prices when rates change.
                  </span>
                </div>
                <Switch id="auto-calc" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
