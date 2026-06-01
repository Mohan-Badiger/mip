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
import { Download, Search, Filter, Loader2, FileText, ShoppingBag, Truck, CheckCircle, AlertCircle, Clock, Sparkles, RefreshCw, Eye } from "lucide-react";
import JewelryLoader from "@/components/jewelry-loader";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("all");

  // Calculate stats from orders array
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.orderStatus === "received").length;
  const craftingCount = orders.filter(o => o.orderStatus === "processing").length;
  const transitCount = orders.filter(o => o.orderStatus === "shipped").length;
  const deliveredCount = orders.filter(o => o.orderStatus === "delivered").length;

  const filteredOrders = orders.filter(o => {
    const matchesFilter = activeFilterTab === "all" || o.orderStatus === activeFilterTab;
    const orderIdLabel = o.razorpayOrderId || o._id.toString();
    const customerName = o.user?.name || "Guest Customer";
    const customerEmail = o.user?.email || "";
    
    // Support searching within locked items name too!
    const itemNames = o.items?.map(i => i.name).join(" ") || "";

    const searchLower = search.toLowerCase();
    const matchesSearch = 
      orderIdLabel.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      customerEmail.toLowerCase().includes(searchLower) ||
      itemNames.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  async function fetchOrders(searchQuery = "") {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(search);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.orderStatus);
    setTrackingId(order.trackingId || "");
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          orderStatus,
          trackingId
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsDialogOpen(false);
        fetchOrders(search);
      } else {
        alert(json.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Error saving status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer,Email,Phone,Items,Total,Payment Status,Order Status,Date\r\n";

    orders.forEach(o => {
      const orderId = o.razorpayOrderId || o._id;
      const customer = o.user?.name || "Guest";
      const email = o.user?.email || "";
      const phone = o.user?.phone || "";
      const itemsCount = o.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
      const total = o.grandTotal;
      const payment = o.paymentStatus;
      const status = o.orderStatus;
      const date = new Date(o.createdAt).toLocaleDateString();

      csvContent += `"${orderId}","${customer}","${email}","${phone}",${itemsCount},${total},"${payment}","${status}","${date}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-bg-cream min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-text-dark font-semibold uppercase">
            Orders Fulfillment
          </h1>
          <p className="text-xs text-muted-foreground">
            Fulfill client purchases, update tracking details, and monitor payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#DED8D0] hover:bg-bg-cream text-xs uppercase tracking-wider h-10 bg-white"
            onClick={() => {
              setSearch("");
              setActiveFilterTab("all");
              fetchOrders("");
            }}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-primary" /> Reset Records
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-[#DED8D0] hover:bg-bg-cream text-xs uppercase tracking-wider h-10 bg-white"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-primary" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Modern KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Orders", value: totalCount, icon: ShoppingBag, color: "text-slate-700 bg-white border-slate-200/60" },
          { label: "Pending Confirmed", value: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-50/25 border-amber-100/50" },
          { label: "In Crafting", value: craftingCount, icon: Sparkles, color: "text-indigo-600 bg-indigo-50/25 border-indigo-100/50" },
          { label: "Insured Transit", value: transitCount, icon: Truck, color: "text-blue-600 bg-blue-50/25 border-blue-100/50" },
          { label: "Delivered", value: deliveredCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50/25 border-emerald-100/50" }
        ].map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <Card key={idx} className="border-[#DED8D0] bg-white shadow-sm transition-all hover:scale-[1.01] duration-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  card.label.includes("Pending") ? "bg-amber-50 text-amber-600" :
                  card.label.includes("Crafting") ? "bg-indigo-50 text-indigo-600" :
                  card.label.includes("Transit") ? "bg-blue-50 text-blue-600" :
                  card.label.includes("Delivered") ? "bg-emerald-50 text-emerald-600" :
                  "bg-slate-50 text-slate-600"
                }`}>
                  <CardIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-heading">{card.label}</span>
                  <span className="text-2xl font-bold font-heading text-text-dark mt-1 block">
                    {card.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter and Search controls */}
      <Card className="border-[#DED8D0] bg-white shadow-sm mt-4">
        <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders(search);
            }}
            className="relative flex-1 max-w-lg w-full"
          >
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-text-dark transition-colors rounded-md hover:bg-bg-cream cursor-pointer border-0 bg-transparent p-0"
              title="Search database"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <Input
              id="orders-search-input"
              type="search"
              placeholder="Search orders, customer or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-10 bg-white border-[#DED8D0] text-xs focus-visible:ring-0 focus-visible:border-slate-450 shadow-none w-full"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-primary" /> Filter:
            </span>
            {[
              { id: "all", label: "All Orders", count: totalCount },
              { id: "received", label: "Received", count: pendingCount },
              { id: "processing", label: "In Crafting", count: craftingCount },
              { id: "shipped", label: "Transit", count: transitCount },
              { id: "delivered", label: "Delivered", count: deliveredCount },
              { id: "cancelled", label: "Cancelled", count: orders.filter(o => o.orderStatus === "cancelled").length }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="outline"
                className={`text-xs px-4 py-2 h-9 rounded-md transition-all shadow-none flex items-center gap-1.5
                  ${activeFilterTab === tab.id 
                    ? "bg-primary/10 text-primary border-primary hover:bg-primary/15 font-semibold" 
                    : "border-[#DED8D0] hover:bg-bg-cream text-muted-foreground hover:text-text-dark bg-white"}`}
                onClick={() => setActiveFilterTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors ml-1
                  ${activeFilterTab === tab.id ? "bg-primary text-white" : "bg-bg-cream text-muted-foreground border border-[#DED8D0]"}`}>
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders Ledger Table */}
      <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden mt-6">
        <Table>
          <TableHeader className="bg-bg-cream">
            <TableRow className="border-b border-[#DED8D0]">
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pl-6">Order ID</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Customer</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Date</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Items</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Total Amount</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Payment Status</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Order Status</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <JewelryLoader size="md" label="Retrieving orders ledger..." />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-450 border-0">
                  <ShoppingBag className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                  <p className="text-base font-medium text-slate-600">No orders logged</p>
                  <p className="text-xs mt-1">Once client checkouts succeed, they will list here.</p>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-450 border-0">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-slate-600">No orders found matching criteria</p>
                  <p className="text-xs mt-1">There are no orders matching status or search query.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const itemQty = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                const orderIdLabel = order.razorpayOrderId || order._id.toString().slice(-8).toUpperCase();
                return (
                  <TableRow key={order._id} className="border-b border-[#DED8D0]/60 hover:bg-bg-cream/30 transition-all">
                    <TableCell className="font-mono text-xs font-semibold text-primary py-4 pl-6">
                      #{orderIdLabel}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-semibold text-text-dark text-xs">{order.user?.name || "Guest Customer"}</div>
                      <div className="text-[10px] text-muted-foreground normal-case font-normal">{order.user?.email || ""}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-4">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700 text-xs py-4">{itemQty}</TableCell>
                    <TableCell className="text-xs font-bold text-text-dark font-heading py-4">
                      ₹{order.grandTotal.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={`capitalize font-bold text-[10px] px-2 py-0.5 rounded shadow-none ${order.paymentStatus === "captured" ? "bg-green-50 text-green-700 border-green-200" :
                          order.paymentStatus === "authorized" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            order.paymentStatus === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {(() => {
                        switch (order.orderStatus) {
                          case 'received':
                            return (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 flex items-center w-max gap-1 text-[10px] font-normal shadow-none border">
                                <Clock className="w-3 h-3" /> Pending/Received
                              </Badge>
                            );
                          case 'processing':
                            return (
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center w-max gap-1 text-[10px] font-normal shadow-none border">
                                <Sparkles className="w-3 h-3" /> In Crafting
                              </Badge>
                            );
                          case 'shipped':
                            return (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center w-max gap-1 text-[10px] font-normal shadow-none border">
                                <Truck className="w-3 h-3" /> Transit/Shipped
                              </Badge>
                            );
                          case 'delivered':
                            return (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center w-max gap-1 text-[10px] font-normal shadow-none border">
                                <CheckCircle className="w-3 h-3" /> Delivered Success
                              </Badge>
                            );
                          case 'cancelled':
                            return (
                              <Badge className="bg-rose-50 text-rose-700 border-rose-200 flex items-center w-max gap-1 text-[10px] font-normal shadow-none border">
                                <AlertCircle className="w-3 h-3" /> Cancelled
                              </Badge>
                            );
                          default:
                            return <Badge variant="secondary" className="text-[10px]">{order.orderStatus}</Badge>;
                        }
                      })()}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <Button
                        onClick={() => openOrderDetails(order)}
                        variant="ghost"
                        size="sm"
                        className="h-8 hover:bg-muted text-primary hover:text-primary-dark font-semibold text-xs gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto font-sans p-0 rounded-2xl border-slate-100 shadow-2xl bg-white **:data-[slot=dialog-close]:text-white/80 **:data-[slot=dialog-close]:hover:text-white **:data-[slot=dialog-close]:hover:bg-white/10 **:data-[slot=dialog-close]:top-4 **:data-[slot=dialog-close]:right-4">
          {selectedOrder && (
            <>
              <div className="bg-slate-900/90 text-white p-6 rounded-t-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
                <DialogHeader className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-400/25 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-400/30">
                      Order Fulfillment Manager
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-secondary uppercase tracking-wide text-white">
                    Order Details #{selectedOrder.razorpayOrderId || selectedOrder._id.toString().slice(-8).toUpperCase()}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-355 mt-1.5 leading-relaxed">
                    Manage shipment tracking, update fulfillment state, and review client items.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6">
                {/* Visual Stepper for Admin Detail Panel */}
                <div className="border border-slate-100 p-5 rounded-xl bg-slate-50/50 shadow-3xs my-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 font-sans">Current Order Progress</h4>
                  <div className="relative px-4">
                    {/* Background line aligned with circle center */}
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 -z-10" />
                    {/* Completed progress line */}
                    {(() => {
                      const steps = ['received', 'processing', 'shipped', 'delivered'];
                      const currentIdx = steps.indexOf(selectedOrder.orderStatus);
                      const fillPercent = currentIdx >= 0 ? (currentIdx / 3) * 100 : 0;
                      return (
                        <div className="absolute top-4 left-4 right-4 h-0.5 -translate-y-1/2 -z-10 overflow-hidden">
                          <div className="h-full bg-slate-800 transition-all duration-500" style={{ width: `${fillPercent}%` }} />
                        </div>
                      );
                    })()}

                    {/* Nodes row with items-start alignment */}
                    <div className="flex justify-between items-start">
                      {['Received', 'Crafting', 'Shipped', 'Delivered'].map((step, idx) => {
                        const steps = ['received', 'processing', 'shipped', 'delivered'];
                        const currentIdx = steps.indexOf(selectedOrder.orderStatus);
                        const isCompleted = idx < currentIdx;
                        const isActive = idx === currentIdx;
                        const isCancelled = selectedOrder.orderStatus === 'cancelled';

                        return (
                          <div key={idx} className="flex flex-col items-center w-20 text-center font-sans">
                            {/* Circle Node (aligned at top, centered horizontally) */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all bg-white shrink-0 ${isCancelled
                              ? 'bg-rose-50 border-rose-200 text-rose-500'
                              : isCompleted
                                ? 'bg-slate-800 border-slate-800 text-white'
                                : isActive
                                  ? 'bg-white border-slate-800 text-slate-800 ring-4 ring-slate-100'
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}>
                              {isCancelled ? '✕' : isCompleted ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[10px] font-semibold mt-2 block w-full whitespace-nowrap ${isActive ? 'text-slate-850 font-bold' : 'text-slate-400'
                              }`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-2">
                  {/* Left Column - Customer info, Address, Payment info & Fulfillment form */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Customer & Shipping Info */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-4 shadow-sm">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-2 font-sans">Customer Info</h3>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-slate-800">{selectedOrder.user?.name || "Guest"}</p>
                          <p className="text-slate-500 text-xs">{selectedOrder.user?.email || "No email"}</p>
                          <p className="text-slate-505 text-xs">{selectedOrder.user?.phone || "No phone"}</p>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 mb-2 font-sans">Shipping Address</h3>
                        <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
                          <p className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.street}</p>
                          <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                          <p className="font-mono text-[10px] font-bold text-slate-500 mt-1">PIN: {selectedOrder.shippingAddress?.pincode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Calculations & Payment Details */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl shadow-sm space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-2 font-sans">Transaction Details</h4>
                      <p className="text-xs text-slate-605">
                        <span className="font-medium text-slate-500">Payment Method:</span> <span className="font-semibold uppercase text-slate-700 bg-white px-1.5 py-0.5 border rounded-xs">{selectedOrder.paymentMethod || 'Online'}</span>
                      </p>
                      <p className="text-xs text-slate-605">
                        <span className="font-medium text-slate-500">Gateway Order ID:</span> <span className="font-mono bg-white px-1.5 py-0.5 border rounded-xs">{selectedOrder.razorpayOrderId}</span>
                      </p>
                      <p className="text-xs text-slate-605">
                        <span className="font-medium text-slate-500">Payment Transaction ID:</span> <span className="font-mono bg-white px-1.5 py-0.5 border rounded-xs">{selectedOrder.razorpayPaymentId || "None"}</span>
                      </p>
                    </div>

                    {/* Fulfillment Panel */}
                    <form onSubmit={handleUpdateStatus} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4 shadow-sm">
                      <h3 className="font-secondary uppercase text-sm font-semibold tracking-wider text-slate-700">Fulfillment Panel</h3>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="order-status-sel" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fulfillment Stage</Label>
                          <Select
                            value={orderStatus}
                            onValueChange={setOrderStatus}
                          >
                            <SelectTrigger id="order-status-sel" className="bg-white border-slate-200 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-9999">
                              <SelectItem value="received">Received / Pending</SelectItem>
                              <SelectItem value="processing">Processing Order (Crafting)</SelectItem>
                              <SelectItem value="shipped">Shipped Package (Transit)</SelectItem>
                              <SelectItem value="delivered">Delivered Successfully (Delivered)</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="order-track-id" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Courier Tracking ID</Label>
                          <Input
                            id="order-track-id"
                            placeholder="e.g. BLUEDART723004"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            className="bg-white border-slate-200 text-xs h-9 shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-300 bg-white text-xs h-9 hover:bg-slate-50 transition-colors">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 transition-colors">
                          {isSaving ? "Saving..." : "Update Shipment"}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column - Purchased items list and totals */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Purchased Items */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 font-sans">Purchased Items</h3>
                      <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow>
                              <TableHead className="py-2.5 text-xs font-bold text-slate-600">Item Details</TableHead>
                              <TableHead className="py-2.5 text-right text-xs font-bold text-slate-600">Qty</TableHead>
                              <TableHead className="py-2.5 text-right text-xs font-bold text-slate-600">Gold Rate</TableHead>
                              <TableHead className="py-2.5 text-right text-xs font-bold text-slate-600">Making Charges</TableHead>
                              <TableHead className="py-2.5 text-right text-xs font-bold text-slate-600">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedOrder.items?.map((item, idx) => (
                              <TableRow key={idx} className="border-t border-slate-100 hover:bg-slate-50/30 transition-colors">
                                <TableCell className="py-3">
                                  <div className="font-semibold text-slate-800 text-xs">{item.name}</div>
                                  <div className="text-[10px] text-slate-450 capitalize mt-0.5">
                                    {item.metalWeightLocked}g ({item.metalPurityLocked})
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 text-right font-bold text-xs text-slate-700">{item.quantity}</TableCell>
                                <TableCell className="py-3 text-right font-mono text-[11px] text-slate-500">
                                  ₹{item.goldRateLocked?.toLocaleString("en-IN")}/g
                                </TableCell>
                                <TableCell className="py-3 text-right font-mono text-[11px] text-slate-500">
                                  ₹{item.makingChargesLocked?.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="py-3 text-right font-bold text-xs text-slate-800">
                                  ₹{item.finalPriceLocked?.toLocaleString("en-IN")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Calculations summary */}
                    <div className="w-full space-y-3.5 text-xs bg-slate-50/50 p-4 border border-slate-100 rounded-xl shadow-sm">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span>
                        <span className="font-mono font-medium text-slate-700">₹{selectedOrder.subTotal?.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>GST (3%):</span>
                        <span className="font-mono font-medium text-slate-700">₹{selectedOrder.taxAmount?.toLocaleString("en-IN")}</span>
                      </div>
                      {selectedOrder.couponCode && (
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Coupon Applied:</span>
                          <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded uppercase">
                            {selectedOrder.couponCode}
                          </span>
                        </div>
                      )}
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>Discount Amount:</span>
                          <span className="font-mono font-medium text-emerald-600">-₹{selectedOrder.discountAmount?.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-3 mt-1.5">
                        <span>Grand Total:</span>
                        <span className="font-mono text-sm text-slate-900 font-extrabold">₹{selectedOrder.grandTotal?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
