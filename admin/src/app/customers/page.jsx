"use client";

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
import { Download, Search, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

const customers = [
  {
    id: "CUS001",
    name: "Priya Sharma",
    email: "priya.s@example.com",
    phone: "+91 9876543210",
    orders: 12,
    spent: "₹4,25,000",
    status: "VIP",
  },
  {
    id: "CUS002",
    name: "Rahul Verma",
    email: "rahul.v@example.com",
    phone: "+91 9876543211",
    orders: 2,
    spent: "₹85,000",
    status: "Active",
  },
  {
    id: "CUS003",
    name: "Anita Desai",
    email: "anita.d@example.com",
    phone: "+91 9876543212",
    orders: 5,
    spent: "₹3,10,000",
    status: "Active",
  },
  {
    id: "CUS004",
    name: "Karan Patel",
    email: "karan.p@example.com",
    phone: "+91 9876543213",
    orders: 1,
    spent: "₹65,000",
    status: "Inactive",
  },
  {
    id: "CUS005",
    name: "Neha Gupta",
    email: "neha.g@example.com",
    phone: "+91 9876543214",
    orders: 8,
    spent: "₹4,20,000",
    status: "VIP",
  },
];

export default function CustomersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer relationships and view order history.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button>
            <Mail className="mr-2 h-4 w-4" /> Send Campaign
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.name}
                    <div className="text-xs text-muted-foreground">
                      {customer.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {customer.phone}
                    </div>
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{customer.spent}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "VIP"
                          ? "default"
                          : customer.status === "Active"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
