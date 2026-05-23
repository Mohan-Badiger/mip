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
import { Download, Search, Filter, Loader2, FileText, ShoppingBag, Truck, CheckCircle, AlertCircle } from "lucide-react";
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
    <div className="flex-1 space-y-4 p-8 pt-6 font-sans">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-secondary uppercase text-slate-800">
            Orders Fulfillment
          </h2>
          <p className="text-sm text-slate-500">
            Fulfill client purchases, update tracking details, and monitor payments.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExportCSV} variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-700">
            <Download className="mr-2 h-4 w-4" /> Export CSV
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
                placeholder="Search orders, customer or ID..."
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
              <JewelryLoader size="md" label="Retrieving orders ledger..." />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed rounded-lg">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-600">No orders logged</p>
              <p className="text-xs mt-1">Once client checkouts succeed, they will list here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-600">Order ID</TableHead>
                  <TableHead className="font-semibold text-slate-600">Customer</TableHead>
                  <TableHead className="font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="font-semibold text-slate-600">Items</TableHead>
                  <TableHead className="font-semibold text-slate-600">Total Amount</TableHead>
                  <TableHead className="font-semibold text-slate-600">Payment Status</TableHead>
                  <TableHead className="font-semibold text-slate-600">Order Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const itemQty = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                  const orderIdLabel = order.razorpayOrderId || order._id.toString().slice(-8).toUpperCase();
                  return (
                    <TableRow key={order._id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-slate-800">
                        #{orderIdLabel}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{order.user?.name || "Guest Customer"}</div>
                        <div className="text-xs text-slate-400">{order.user?.email || ""}</div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">{itemQty}</TableCell>
                      <TableCell className="font-bold text-slate-900">
                        ₹{order.grandTotal.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize font-bold text-[10px] ${
                            order.paymentStatus === "captured" ? "bg-green-50 text-green-700 border-green-200" :
                            order.paymentStatus === "authorized" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            order.paymentStatus === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize font-bold text-[10px] ${
                            order.orderStatus === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            order.orderStatus === "shipped" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            order.orderStatus === "processing" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => openOrderDetails(order)} variant="ghost" size="sm" className="h-8 hover:bg-slate-100 text-slate-700">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View & Update Order Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto font-sans p-6 rounded-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-secondary uppercase text-slate-800 tracking-wider">
                  Order Details
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Manage shipment tracking, update fulfillment state, and review client items.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* 1. Customer & Shipping Info */}
                <div className="grid gap-4 md:grid-cols-2 bg-slate-50/50 p-4 border rounded-md">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Customer Info</h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-slate-800">{selectedOrder.user?.name || "Guest"}</p>
                      <p className="text-slate-500">{selectedOrder.user?.email || "No email"}</p>
                      <p className="text-slate-500">{selectedOrder.user?.phone || "No phone"}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Shipping Address</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>{selectedOrder.shippingAddress?.street}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      <p className="font-mono text-xs">PIN: {selectedOrder.shippingAddress?.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Order Items */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Purchased Items</h3>
                  <div className="border rounded-md overflow-hidden bg-white">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="py-2">Item Details</TableHead>
                          <TableHead className="py-2 text-right">Qty</TableHead>
                          <TableHead className="py-2 text-right">Gold Rate Locked</TableHead>
                          <TableHead className="py-2 text-right">Making Charges</TableHead>
                          <TableHead className="py-2 text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items?.map((item, index) => (
                          <TableRow key={index} className="border-t">
                            <TableCell className="py-3">
                              <div className="font-medium text-slate-800">{item.name}</div>
                              <div className="text-xs text-slate-400 capitalize">
                                {item.metalWeightLocked}g ({item.metalPurityLocked})
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right font-semibold">{item.quantity}</TableCell>
                            <TableCell className="py-3 text-right font-mono text-xs">
                              ₹{item.goldRateLocked?.toLocaleString("en-IN")}/g
                            </TableCell>
                            <TableCell className="py-3 text-right font-mono text-xs">
                              ₹{item.makingChargesLocked?.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="py-3 text-right font-semibold">
                              ₹{item.finalPriceLocked?.toLocaleString("en-IN")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 3. Calculations & Payment Details */}
                <div className="flex flex-col md:flex-row items-stretch gap-4 justify-between">
                  <div className="flex-1 bg-slate-50/50 p-4 border rounded-md flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Razorpay Details</h4>
                      <p className="text-xs text-slate-600 mb-1">
                        <span className="font-medium">Order ID:</span> <span className="font-mono">{selectedOrder.razorpayOrderId}</span>
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Payment ID:</span> <span className="font-mono">{selectedOrder.razorpayPaymentId || "None"}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64 space-y-1.5 text-sm bg-slate-50/50 p-4 border rounded-md">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-mono">₹{selectedOrder.subTotal?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>GST (3%):</span>
                      <span className="font-mono">₹{selectedOrder.taxAmount?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 border-t pt-1.5">
                      <span>Grand Total:</span>
                      <span className="font-mono">₹{selectedOrder.grandTotal?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Update Status and Tracking ID */}
                <form onSubmit={handleUpdateStatus} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 space-y-4">
                  <h3 className="font-secondary uppercase text-sm font-semibold tracking-wider text-slate-700">Fulfillment Panel</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="order-status-sel">Fulfillment Stage</Label>
                      <Select
                        value={orderStatus}
                        onValueChange={setOrderStatus}
                      >
                        <SelectTrigger id="order-status-sel" className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="received">Received / Pending</SelectItem>
                          <SelectItem value="processing">Processing Order</SelectItem>
                          <SelectItem value="shipped">Shipped Package</SelectItem>
                          <SelectItem value="delivered">Delivered Successfully</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="order-track-id">Courier Tracking ID</Label>
                      <Input
                        id="order-track-id"
                        placeholder="e.g. BLUEDART723004"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="bg-white border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-300 bg-white">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                      {isSaving ? "Saving..." : "Update Shipment Info"}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
