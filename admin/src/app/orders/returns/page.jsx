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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  IndianRupee,
  FileText,
} from "lucide-react";

// Mock database return records
const INITIAL_RETURNS = [
  {
    id: "RET-2026-001",
    orderId: "MIP-ORD-98421",
    customer: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    productName: "22KT Gold Kundan Choker Set",
    weight: "34.5g",
    refundAmount: 245000,
    reason: "Purity certification discrepancy (Buyer requested local lab check re-verification)",
    status: "Requested",
    date: "May 20, 2026",
    notes: "Customer contacted support regarding BIS hallmark verification. Arranging pickup for evaluation."
  },
  {
    id: "RET-2026-002",
    orderId: "MIP-ORD-98104",
    customer: "Rohan Mehra",
    email: "rohan.mehra@yahoo.com",
    productName: "Signature Platinum Solitaire Ring",
    weight: "4.2g",
    refundAmount: 92000,
    reason: "Incorrect ring size (Ordered size 14, needs size 16 exchange/refund)",
    status: "Approved",
    date: "May 18, 2026",
    notes: "Return approved. Return shipping label sent to customer. Awaiting shipment."
  },
  {
    id: "RET-2026-003",
    orderId: "MIP-ORD-97592",
    customer: "Ananya Iyer",
    email: "ananya.iyer@outlook.com",
    productName: "Antique Temple Gold Jhumkas",
    weight: "18.2g",
    refundAmount: 128000,
    reason: "Damaged during transit (Pushback post mechanism was bent)",
    status: "Item Received",
    date: "May 15, 2026",
    notes: "Item received at HQ. Quality assurance team verified transit damage to clasp. Processing refund."
  },
  {
    id: "RET-2026-004",
    orderId: "MIP-ORD-96901",
    customer: "Kabir Mehta",
    email: "kabir.mehta@gmail.com",
    productName: "Anti-tarnish Silver Link Bracelet",
    weight: "12.0g",
    refundAmount: 7500,
    reason: "Buyer remorse (Decided to buy gold alternative instead)",
    status: "Refunded",
    date: "May 10, 2026",
    notes: "Refund processed via Razorpay API gateway transaction id: pay_RT9388271."
  }
];

export default function ReturnsPage() {
  const [returns, setReturns] = useState(INITIAL_RETURNS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  const handleOpenDetails = (ret) => {
    setSelectedReturn(ret);
    setNotesInput(ret.notes);
    setStatusInput(ret.status);
  };

  const handleSaveReturnStatus = () => {
    if (!selectedReturn) return;
    setReturns(prev =>
      prev.map(item =>
        item.id === selectedReturn.id
          ? { ...item, status: statusInput, notes: notesInput }
          : item
      )
    );
    setSelectedReturn(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Requested":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 flex items-center w-max gap-1">
            <Clock className="w-3 h-3" /> Requested
          </Badge>
        );
      case "Approved":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center w-max gap-1">
            <Truck className="w-3 h-3" /> Approved
          </Badge>
        );
      case "Item Received":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 flex items-center w-max gap-1">
            <AlertCircle className="w-3 h-3" /> Item Received
          </Badge>
        );
      case "Refunded":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center w-max gap-1">
            <CheckCircle className="w-3 h-3" /> Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredReturns = returns.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-bg-cream min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-text-dark font-semibold uppercase">
            Order Returns & Refunds
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage return requests, verify product weights/purity, and process customer refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#DED8D0] hover:bg-bg-cream text-xs uppercase tracking-wider h-10"
            onClick={() => setReturns(INITIAL_RETURNS)}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-primary" /> Reset Records
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-[#DED8D0] bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-heading">Awaiting Review</span>
              <span className="text-2xl font-bold font-heading text-text-dark">
                {returns.filter(r => r.status === "Requested").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-heading">In Transit (Approved)</span>
              <span className="text-2xl font-bold font-heading text-text-dark">
                {returns.filter(r => r.status === "Approved").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-heading">Received & Evaluating</span>
              <span className="text-2xl font-bold font-heading text-text-dark">
                {returns.filter(r => r.status === "Item Received").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DED8D0] bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-heading">Refunded Volume</span>
              <span className="text-2xl font-bold font-heading text-text-dark flex items-center">
                <IndianRupee className="w-5 h-5 text-primary shrink-0" />
                {(returns.filter(r => r.status === "Refunded").reduce((acc, curr) => acc + curr.refundAmount, 0) / 1000).toFixed(1)}k
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search controls */}
      <Card className="border-[#DED8D0] bg-white shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Return ID, Order ID, customer, jewellery name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "Requested", "Approved", "Item Received", "Refunded"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                className={`text-xs px-4 py-2 h-9 rounded-md transition-all shadow-none
                  ${statusFilter === status 
                    ? "bg-text-dark text-white hover:bg-[#2C2C2C]" 
                    : "border-[#DED8D0] hover:bg-bg-cream text-muted-foreground hover:text-text-dark"}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === "ALL" ? "All Returns" : status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Returns Ledger Table */}
      <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-bg-cream">
            <TableRow className="border-b border-[#DED8D0]">
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pl-6">Return ID</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Order ID</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Customer</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Jewellery Item</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Refund Amount</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Return Date</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Status</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReturns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground font-mono">
                  No return requests found matching the parameters.
                </TableCell>
              </TableRow>
            ) : (
              filteredReturns.map((ret) => (
                <TableRow key={ret.id} className="border-b border-[#DED8D0]/60 hover:bg-bg-cream/30 transition-all">
                  <TableCell className="font-mono text-xs font-semibold text-primary py-4 pl-6">{ret.id}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-650">{ret.orderId}</TableCell>
                  <TableCell className="text-xs font-semibold text-text-dark">
                    <div>{ret.customer}</div>
                    <div className="text-[10px] text-muted-foreground font-normal normal-case">{ret.email}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-medium text-slate-800">{ret.productName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">Weight: {ret.weight}</div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-text-dark font-heading">
                    ₹{ret.refundAmount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ret.date}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(ret.status)}</TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 hover:bg-muted text-primary hover:text-primary-dark font-semibold text-xs gap-1"
                      onClick={() => handleOpenDetails(ret)}
                    >
                      <Eye className="w-3.5 h-3.5" /> Evaluate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Return Evaluation Modal */}
      <Dialog open={selectedReturn !== null} onOpenChange={(open) => !open && setSelectedReturn(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] overflow-y-auto bg-white border-[#DED8D0] font-sans p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg uppercase tracking-wider text-text-dark flex items-center gap-2 border-b pb-3 border-[#DED8D0]">
              <RotateCcw className="w-5 h-5 text-primary" /> Evaluate Return {selectedReturn?.id}
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Verify customer complaint details and update status workflow below.
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-2">
              {/* Left Column: Context Details & Declared Reason */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 bg-bg-cream p-4 rounded-xl border border-[#DED8D0] text-xs shadow-sm">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-heading">Customer</span>
                    <span className="font-semibold text-slate-800">{selectedReturn.customer}</span>
                    <span className="block text-muted-foreground text-[10px]">{selectedReturn.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-heading">Order Context</span>
                    <span className="font-semibold text-slate-800">Order ID: {selectedReturn.orderId}</span>
                    <span className="block text-muted-foreground text-[10px]">Requested on: {selectedReturn.date}</span>
                  </div>
                  <div className="col-span-2 border-t border-[#DED8D0]/60 pt-2.5">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-heading">Return Item Description</span>
                    <span className="font-semibold text-slate-800">{selectedReturn.productName}</span>
                    <span className="font-mono text-muted-foreground block text-[10px]">Net Purity/Weight details: {selectedReturn.weight}</span>
                  </div>
                </div>

                {/* Return Reason Card */}
                <div className="space-y-1 bg-rose-50/45 border border-rose-150 p-3.5 rounded-xl shadow-sm">
                  <span className="text-[9px] uppercase tracking-wider text-rose-800 font-bold font-heading flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Buyer Declared Reason
                  </span>
                  <p className="text-xs text-rose-950 italic">
                    &ldquo;{selectedReturn.reason}&rdquo;
                  </p>
                </div>
              </div>

              {/* Right Column: Workflow update dropdown & QA Notes */}
              <div className="space-y-4">
                {/* Status Select dropdown */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Transition Process Status</span>
                  <Select value={statusInput} onValueChange={setStatusInput}>
                    <SelectTrigger className="w-full bg-white border-[#DED8D0] text-xs focus:ring-primary shadow-none rounded-lg h-9">
                      <SelectValue placeholder="Select Action Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#DED8D0]">
                      <SelectItem value="Requested" className="text-xs">Requested (Pending Evaluation)</SelectItem>
                      <SelectItem value="Approved" className="text-xs">Approved (Shipping Label Sent)</SelectItem>
                      <SelectItem value="Item Received" className="text-xs">Item Received (Verifying Weight & Seal)</SelectItem>
                      <SelectItem value="Refunded" className="text-xs">Refunded (Issue funds to Razorpay/Bank)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Internal Notes/Audit Trail */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-1">
                    <FileText className="w-3 h-3" /> QA & Evaluation Notes
                  </span>
                  <textarea
                    className="w-full min-h-22.5 p-3 text-xs bg-white border border-[#DED8D0] rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-none resize-none"
                    placeholder="Record metal verification results, shipping numbers, or gateway refund numbers..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-[#DED8D0] pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedReturn(null)}
              className="border-[#DED8D0] text-xs font-heading uppercase tracking-wider shadow-none h-10 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReturnStatus}
              className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream text-xs font-heading uppercase tracking-wider px-5 shadow-none h-10 rounded-lg"
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
