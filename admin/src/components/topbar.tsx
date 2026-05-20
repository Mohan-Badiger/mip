"use client";

import { Bell, Search, TrendingUp } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-4">
        <form className="relative flex-1 max-w-md hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products, orders..."
            className="w-full bg-background pl-8 shadow-none"
          />
        </form>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-sm text-sm font-medium border border-primary/20">
          <TrendingUp className="w-4 h-4" />
          22K Gold: ₹6,500/g
        </div>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}
