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
import { Download, Search, Mail, Loader2, Sparkles, UserCheck } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";
import { Input } from "@/components/ui/input";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchCustomers(searchQuery = "") {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch customers:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    let csvContent = "Customer Name,Email,Phone,Total Orders,Total Spent (₹),Status\r\n";
    
    customers.forEach(c => {
      csvContent += `"${c.name}","${c.email}","${c.phone}",${c.orders},${c.spent},"${c.status}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${Date.now()}.csv`);
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
            Customers Ledger
          </h2>
          <p className="text-sm text-slate-500">
            Monitor customer accounts, inspect their purchase volumes, and view VIP flags.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExportCSV} variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-700">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            <Mail className="mr-2 h-4 w-4" /> Send Campaign
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
                placeholder="Search customers by name, phone..."
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
              <JewelryLoader size="md" label="Retrieving customer directory..." />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed rounded-lg">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-600">No customers registered</p>
              <p className="text-xs mt-1">Once client signups occur, they will display in this list.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                  <TableHead className="font-semibold text-slate-600">Contact</TableHead>
                  <TableHead className="font-semibold text-slate-600">Total Orders</TableHead>
                  <TableHead className="font-semibold text-slate-600">Total Spent</TableHead>
                  <TableHead className="font-semibold text-slate-600">Fulfillment Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      {customer.name}
                      <div className="text-xs text-slate-400 font-mono">
                        ID: {customer._id.toString().slice(-8).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-700">{customer.email}</div>
                      <div className="text-xs text-slate-400">{customer.phone}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">{customer.orders}</TableCell>
                    <TableCell className="font-bold text-slate-900">
                      ₹{customer.spent.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "VIP"
                            ? "default"
                            : customer.status === "Active"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          customer.status === "VIP" ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100" :
                          customer.status === "Active" ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50" :
                          "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }) : "N/A"}
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
