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
  Clock,
  Search,
  Check,
  X,
  Mail,
  Phone,
} from "lucide-react";

// Mock user listings representing shop staff and admins
const INITIAL_STAFF = [
  {
    id: "STF-001",
    name: "Mohan Badiger",
    email: "super.admin@mip.com",
    phone: "+91 9845012345",
    role: "Super Admin",
    status: "Active",
    joinedDate: "Jan 10, 2025"
  },
  {
    id: "STF-002",
    name: "Aarav Deshmukh",
    email: "aarav.d@mip.com",
    phone: "+91 9866299102",
    role: "Catalog Manager",
    status: "Active",
    joinedDate: "Feb 14, 2025"
  },
  {
    id: "STF-003",
    name: "Pooja Hegde",
    email: "pooja.h@mip.com",
    phone: "+91 9741235678",
    role: "CMS Editor",
    status: "Active",
    joinedDate: "Mar 01, 2025"
  },
  {
    id: "STF-004",
    name: "Karan Johar",
    email: "karan.j@mip.com",
    phone: "+91 8123456789",
    role: "Sales Representative",
    status: "Suspended",
    joinedDate: "Apr 20, 2025"
  }
];

export default function AdminUsersPage() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
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

  const handleOpenAdd = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Sales Representative");
    setFormStatus("Active");
    setIsAddOpen(true);
  };

  const handleCreateUser = () => {
    if (!formName || !formEmail) {
      alert("Please fill in the Name and Email.");
      return;
    }
    const newStaff = {
      id: `STF-00${staff.length + 1}`,
      name: formName,
      email: formEmail,
      phone: formPhone || "+91 9999999999",
      role: formRole,
      status: formStatus,
      joinedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      })
    };
    setStaff(prev => [...prev, newStaff]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsEditOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    setStaff(prev =>
      prev.map(item =>
        item.id === selectedUser.id
          ? {
              ...item,
              name: formName,
              email: formEmail,
              phone: formPhone,
              role: formRole,
              status: formStatus
            }
          : item
      )
    );
    setIsEditOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (id) => {
    setStaff(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === "Active" ? "Suspended" : "Active" }
          : item
      )
    );
  };

  const handleDeleteUser = (id) => {
    if (confirm("Are you sure you want to remove this administrator's credentials?")) {
      setStaff(prev => prev.filter(item => item.id !== id));
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
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DED8D0] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading tracking-wide text-[#1A1A1A] font-semibold uppercase">
            Administrative Users
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage administrative credentials, assign catalog / content permission roles, and monitor team status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAdd}
            className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-xs font-heading uppercase tracking-wider h-10 px-5 shadow-none"
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
          <TableHeader className="bg-[#FAF8F5]">
            <TableRow className="border-b border-[#DED8D0]">
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pl-6">ID</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Name</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Contacts</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Assigned Role</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Status</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4">Joined Date</TableHead>
              <TableHead className="text-[10px] font-heading uppercase text-muted-foreground font-semibold py-4 pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground font-mono">
                  No administrative staff found matching the parameters.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((user) => (
                <TableRow key={user.id} className="border-b border-[#DED8D0]/60 hover:bg-[#FAF8F5]/30 transition-all">
                  <TableCell className="font-mono text-xs font-semibold text-primary py-4 pl-6">{user.id}</TableCell>
                  <TableCell className="text-xs font-semibold text-[#1A1A1A]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-[#FAF8F5] border border-[#DED8D0] text-primary flex items-center justify-center font-heading text-[10px] font-bold">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5 text-[#1A1A1A]">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {user.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mt-0.5">
                      <Phone className="w-3 h-3 text-muted-foreground" /> {user.phone}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`text-[9px] uppercase tracking-wider font-semibold py-0.5 px-2 ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      onClick={() => handleToggleStatus(user.id)}
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
                        className="w-8 h-8 text-muted-foreground hover:text-[#1A1A1A] hover:bg-muted"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={user.role === "Super Admin"}
                        className="w-8 h-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-20"
                        onClick={() => handleDeleteUser(user.id)}
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
        <DialogContent className="max-w-md bg-white border-[#DED8D0] p-6 rounded-lg font-sans">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2 border-b pb-3 border-[#DED8D0]">
              <Plus className="w-5 h-5 text-primary" /> Create Administrator
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Add new staff credentials and configure operational roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="add-name" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Full Name</Label>
              <Input
                id="add-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Vikram Sethi"
                className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="add-email" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Email Address</Label>
              <Input
                id="add-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. vikram.s@mip.com"
                className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="add-phone" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Phone Contact</Label>
              <Input
                id="add-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +91 98450 98450"
                className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="add-role" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Operational Role</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger className="w-full bg-white border-[#DED8D0] text-xs focus:ring-primary shadow-none">
                  <SelectValue placeholder="Select Permission Role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#DED8D0]">
                  <SelectItem value="Super Admin" className="text-xs">Super Admin (All Nodes Access)</SelectItem>
                  <SelectItem value="Catalog Manager" className="text-xs">Catalog Manager (Product updates only)</SelectItem>
                  <SelectItem value="CMS Editor" className="text-xs">CMS Editor (Banners/Layout access only)</SelectItem>
                  <SelectItem value="Sales Representative" className="text-xs">Sales Representative (Orders access only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="add-status" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Credential Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger className="w-full bg-white border-[#DED8D0] text-xs focus:ring-primary shadow-none">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#DED8D0]">
                  <SelectItem value="Active" className="text-xs">Active (Credentials Unlocked)</SelectItem>
                  <SelectItem value="Suspended" className="text-xs">Suspended (Access Terminated)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-[#DED8D0] pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              className="border-[#DED8D0] text-xs font-heading uppercase tracking-wider shadow-none h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-xs font-heading uppercase tracking-wider px-5 shadow-none h-10"
            >
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-white border-[#DED8D0] p-6 rounded-lg font-sans">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2 border-b pb-3 border-[#DED8D0]">
              <Edit2 className="w-5 h-5 text-primary" /> Modify Staff Credentials
            </DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Update team details or revoke/grant roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Full Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-email" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-phone" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Phone Contact</Label>
              <Input
                id="edit-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="bg-white border-[#DED8D0] text-xs focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-role" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Operational Role</Label>
              <Select value={formRole} onValueChange={setFormRole} disabled={selectedUser?.role === "Super Admin"}>
                <SelectTrigger className="w-full bg-white border-[#DED8D0] text-xs focus:ring-primary shadow-none">
                  <SelectValue placeholder="Select Permission Role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#DED8D0]">
                  <SelectItem value="Super Admin" className="text-xs">Super Admin</SelectItem>
                  <SelectItem value="Catalog Manager" className="text-xs">Catalog Manager</SelectItem>
                  <SelectItem value="CMS Editor" className="text-xs">CMS Editor</SelectItem>
                  <SelectItem value="Sales Representative" className="text-xs">Sales Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-status" className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">Credential Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus} disabled={selectedUser?.role === "Super Admin"}>
                <SelectTrigger className="w-full bg-white border-[#DED8D0] text-xs focus:ring-primary shadow-none">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#DED8D0]">
                  <SelectItem value="Active" className="text-xs">Active</SelectItem>
                  <SelectItem value="Suspended" className="text-xs">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-[#DED8D0] pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="border-[#DED8D0] text-xs font-heading uppercase tracking-wider shadow-none h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              className="bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAF8F5] text-xs font-heading uppercase tracking-wider px-5 shadow-none h-10"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
