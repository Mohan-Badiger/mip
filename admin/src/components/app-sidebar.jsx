"use client";

import {
  BarChart,
  Box,
  Coins,
  FileText,
  Gift,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const adminLinks = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  { title: "Categories", url: "/categories", icon: Box },
  { title: "Collections", url: "/collections", icon: Star },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Box },
  { title: "Homepage CMS", url: "/cms", icon: Home },
  { title: "Offers", url: "/offers", icon: Gift },
  { title: "Gold Rates", url: "/gold-rates", icon: Coins },
  { title: "Purchase Plans", url: "/plans", icon: ShoppingBag },
  { title: "Stores", url: "/stores", icon: Store },
  { title: "Blogs", url: "/blogs", icon: FileText },
  { title: "Media", url: "/media", icon: ImageIcon },
  { title: "Reviews", url: "/reviews", icon: MessageSquare },
  { title: "Reports", url: "/reports", icon: BarChart },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex justify-center px-4 border-b border-border/50 overflow-hidden">
        <div className="flex items-center w-full">
          <h2 className="text-xl md:text-2xl font-bold tracking-widest text-secondary-foreground font-sans uppercase truncate whitespace-nowrap">
            {state === "collapsed" ? "MIP" : "MIP ADMIN"}
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-sans">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                    className="hover:text-primary transition-colors tooltip-content font-sans"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-[0.15em] font-medium">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 overflow-hidden">
        <div className="flex items-center gap-2 font-sans">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-sm shrink-0 flex items-center justify-center text-xs">
            SA
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium">Super Admin</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
