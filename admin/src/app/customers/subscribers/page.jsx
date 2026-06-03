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
import { Download, Search, Loader2, Mail, Trash2, CheckCircle2, XCircle } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";
import { Input } from "@/components/ui/input";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  async function fetchSubscribers(searchQuery = "") {
    try {
      setLoading(true);
      const res = await fetch(`/api/subscribers?search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch subscribers:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubscribers(search);
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      setActionLoadingId(id);
      const res = await fetch("/api/subscribers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, active: !currentActive })
      });
      const json = await res.json();
      if (json.success) {
        setSubscribers(prev =>
          prev.map(sub => (sub._id === id ? { ...sub, active: !currentActive } : sub))
        );
      }
    } catch (err) {
      console.error("Failed to toggle subscriber status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteSubscriber = async (id, email) => {
    if (!confirm(`Are you sure you want to permanently delete the subscriber: ${email}?`)) {
      return;
    }
    try {
      setActionLoadingId(id);
      const res = await fetch(`/api/subscribers?id=${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setSubscribers(prev => prev.filter(sub => sub._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    let csvContent = "Email Address,Subscription Date,Status\r\n";
    
    subscribers.forEach(sub => {
      const date = sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("en-IN") : "N/A";
      const status = sub.active ? "Active" : "Inactive";
      csvContent += `"${sub.email}","${date}","${status}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800">
            Newsletter Subscribers
          </h2>
          <p className="text-sm text-slate-500">
            Manage the list of customers who have subscribed to early collection launches, gold rates, and updates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExportCSV} variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-700">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Mail className="mr-2 h-4 w-4" /> Newsletter Campaign
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
                placeholder="Search by subscriber email..."
                className="pl-8 bg-white border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700">
              Filter
            </Button>
          </form>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <JewelryLoader size="md" label="Retrieving newsletter directory..." />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed rounded-lg">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-600">No subscribers found</p>
              <p className="text-xs mt-1">Subscribers from your "Join Our MIP Family" forms will display here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-600">Subscriber Email</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600">Joined Date</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub._id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 py-4">
                      {sub.email}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: {sub._id.toString().toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.active ? "default" : "outline"}
                        className={
                          sub.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-50"
                        }
                      >
                        {sub.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoadingId === sub._id}
                          className="h-8 px-2 hover:bg-slate-100"
                          onClick={() => handleToggleActive(sub._id, sub.active)}
                        >
                          {sub.active ? (
                            <XCircle className="w-4 h-4 text-slate-500 hover:text-slate-700" title="Deactivate Subscription" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 hover:text-emerald-800" title="Activate Subscription" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoadingId === sub._id}
                          className="h-8 px-2 hover:bg-red-50"
                          onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" title="Delete Permanent" />
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
    </div>
  );
}
