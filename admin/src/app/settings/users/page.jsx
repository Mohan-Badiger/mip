"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Search,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

export default function AdminUsersPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("Sales Representative");
  const [formStatus, setFormStatus] = useState("Active");
  const [formPassword, setFormPassword] = useState("");

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/settings/users");
      const data = await res.json();
      if (data.success) {
        setStaff(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Sales Representative");
    setFormStatus("Active");
    setFormPassword("");
    setIsAddOpen(true);
  };

  const handleCreateUser = async () => {
    if (!formName || !formEmail || !formPhone) {
      alert("Please fill in the Name, Email, and Phone.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          status: formStatus,
          password: formPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStaff(prev => [data.data, ...prev]);
        setIsAddOpen(false);
      } else {
        alert(data.error || "Failed to create staff member.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPassword("");
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const payload = {
        _id: selectedUser._id,
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        status: formStatus,
      };
      if (formPassword) payload.password = formPassword;

      const res = await fetch("/api/settings/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setStaff(prev => prev.map(item => item._id === selectedUser._id ? data.data : item));
        setIsEditOpen(false);
        setSelectedUser(null);
      } else {
        alert(data.error || "Failed to update staff member.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    try {
      const res = await fetch("/api/settings/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: user._id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStaff(prev => prev.map(item => item._id === user._id ? data.data : item));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm("Are you sure you want to remove this administrator's credentials?")) return;
    try {
      const res = await fetch(`/api/settings/users?id=${user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStaff(prev => prev.filter(item => item._id !== user._id));
      } else {
        alert(data.error || "Failed to delete staff member.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-[#1A1A1A] text-[#FAF8F5] border-transparent";
      case "Catalog Manager":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CMS Editor":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const filteredStaff = staff.filter(item => {
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-bg-cream min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-text-dark font-semibold uppercase">
            Administrative Users
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage administrative credentials, assign catalog / content permission roles, and monitor team status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAdd}
            className="bg-text-dark hover:bg-[#2C2C2C] text-bg-cream text-xs font-heading uppercase tracking-wider h-10 px-5 shadow-none"
          >
            <Plus className="mr-1.5 h-4 w-4 text-primary" /> Create Administrator
          </Button>
        </div>
      </div>

      {/* Search Filter bar */}
      <Card className="border-[#DED8D0] bg-white shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admin staff by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card className="border-[#DED8D0] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-bg-cream">
            <TableRow className="border-b border-[#DED8D0]">
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pl-6">Name</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Contacts</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Assigned Role</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Status</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Joined Date</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading staff members...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-xs text-muted-foreground font-mono">
                  No administrative staff found matching the parameters.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((user) => (
                <TableRow key={user._id} className="border-b border-[#DED8D0]/60 hover:bg-bg-cream/30 transition-all">
                  <TableCell className="text-xs font-semibold text-text-dark py-4 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-bg-cream border border-[#DED8D0] text-primary flex items-center justify-center font-heading text-[10px] font-bold">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5 text-text-dark">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mt-0.5">
                        <Phone className="w-3 h-3 text-muted-foreground" /> {user.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`text-[9px] uppercase tracking-wider font-semibold py-0.5 px-2 ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      onClick={() => handleToggleStatus(user)}
                      className={`text-[9px] uppercase tracking-wider cursor-pointer font-bold
                        ${user.status === "Active" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-250 hover:bg-rose-100"}`}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.joinedDate}</TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-text-dark hover:bg-muted"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={user.role === "Super Admin"}
                        className="w-8 h-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-20"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto font-sans p-0 rounded-2xl border-slate-100 shadow-2xl bg-white **:data-[slot=dialog-close]:text-white/80 **:data-[slot=dialog-close]:hover:text-white **:data-[slot=dialog-close]:hover:bg-white/10 **:data-[slot=dialog-close]:top-4 **:data-[slot=dialog-close]:right-4">
          <div className="bg-slate-900/90 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400/25 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-400/30">
                  Access Management
                </span>
              </div>
              <DialogTitle className="text-2xl font-secondary uppercase tracking-wide text-white">
                Create Administrator
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Add new staff credentials and configure operational roles.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: Personal Info */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-700" /> Identity & Contact
                </h4>
                
                <div className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-name" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Full Name</Label>
                    <Input
                      id="add-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Vikram Sethi"
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="add-email" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Email Address</Label>
                    <Input
                      id="add-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. vikram.s@mip.com"
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="add-phone" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Phone Contact</Label>
                    <Input
                      id="add-phone"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. +91 98450 98450"
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Roles & Status */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-700" /> System Settings
                </h4>

                <div className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-role" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Operational RoleScope</Label>
                    <Select value={formRole} onValueChange={setFormRole}>
                      <SelectTrigger className="w-full bg-white border-slate-200 text-sm shadow-sm">
                        <SelectValue placeholder="Select Permission Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-150">
                        <SelectItem value="Super Admin" className="text-xs">Super Admin (All Nodes Access)</SelectItem>
                        <SelectItem value="Catalog Manager" className="text-xs">Catalog Manager (Product updates only)</SelectItem>
                        <SelectItem value="CMS Editor" className="text-xs">CMS Editor (Banners/Layout access only)</SelectItem>
                        <SelectItem value="Sales Representative" className="text-xs">Sales Representative (Orders access only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="add-status" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Credential Status</Label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger className="w-full bg-white border-slate-200 text-sm shadow-sm">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-150">
                        <SelectItem value="Active" className="text-xs">Active (Credentials Unlocked)</SelectItem>
                        <SelectItem value="Suspended" className="text-xs">Suspended (Access Terminated)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="add-password" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Initial Password</Label>
                    <Input
                      id="add-password"
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Leave blank for default (MIP@2025)"
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="border-slate-200 hover:bg-slate-50 text-xs rounded-lg h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg h-9"
              >
                {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Creating...</> : "Add Staff Member"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto font-sans p-0 rounded-2xl border-slate-100 shadow-2xl bg-white **:data-[slot=dialog-close]:text-white/80 **:data-[slot=dialog-close]:hover:text-white **:data-[slot=dialog-close]:hover:bg-white/10 **:data-[slot=dialog-close]:top-4 **:data-[slot=dialog-close]:right-4">
          <div className="bg-slate-900/90 text-white p-6 rounded-t-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400/25 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-400/30">
                  Access Management
                </span>
              </div>
              <DialogTitle className="text-2xl font-secondary uppercase tracking-wide text-white">
                Modify Staff Credentials
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Update team details or revoke/grant roles.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: Personal Info */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-700" /> Identity & Contact
                </h4>
                
                <div className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Email Address</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Phone Contact</Label>
                    <Input
                      id="edit-phone"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Roles & Status */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-700" /> System Settings
                </h4>

                <div className="space-y-4 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-role" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Operational RoleScope</Label>
                    <Select value={formRole} onValueChange={setFormRole} disabled={selectedUser?.role === "Super Admin"}>
                      <SelectTrigger className="w-full bg-white border-slate-200 text-sm shadow-sm">
                        <SelectValue placeholder="Select Permission Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-150">
                        <SelectItem value="Super Admin" className="text-xs">Super Admin</SelectItem>
                        <SelectItem value="Catalog Manager" className="text-xs">Catalog Manager</SelectItem>
                        <SelectItem value="CMS Editor" className="text-xs">CMS Editor</SelectItem>
                        <SelectItem value="Sales Representative" className="text-xs">Sales Representative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-status" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Credential Status</Label>
                    <Select value={formStatus} onValueChange={setFormStatus} disabled={selectedUser?.role === "Super Admin"}>
                      <SelectTrigger className="w-full bg-white border-slate-200 text-sm shadow-sm">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-150">
                        <SelectItem value="Active" className="text-xs">Active</SelectItem>
                        <SelectItem value="Suspended" className="text-xs">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-password" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Reset Password</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="bg-white border-slate-200 text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4 flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-slate-200 hover:bg-slate-50 text-xs rounded-lg h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg h-9"
              >
                {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
