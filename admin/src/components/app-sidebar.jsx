"use client";

import {
  Box,
  Coins,
  FileText,
  Gift,
  Home,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Users,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const sidebarGroups = [
  {
    label: "",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ]
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/products", icon: Package },
      { title: "Categories", url: "/categories", icon: Box },
      { title: "Collections", url: "/collections", icon: Star },
    ]
  },
  {
    label: "Website",
    items: [
      { title: "Website CMS", url: "/cms", icon: Home },
    ]
  },
  {
    label: "Orders",
    items: [
      { title: "Orders", url: "/orders", icon: ShoppingCart },
      { title: "Returns", url: "/orders/returns", icon: RotateCcw },
    ]
  },
  {
    label: "Customers",
    items: [
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Reviews", url: "/customers/reviews", icon: MessageSquare },
    ]
  },
  {
    label: "Marketing",
    items: [
      { title: "Offers", url: "/offers", icon: Gift },
    ]
  },
  {
    label: "Store Management",
    items: [
      { title: "Stores", url: "/stores", icon: Store },
      { title: "Gold Rates", url: "/gold-rates", icon: Coins },
    ]
  },
  {
    label: "Settings",
    items: [
      { title: "Admin Users", url: "/settings/users", icon: UserCheck },
      { title: "Website Settings", url: "/settings/website", icon: Settings },
    ]
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex justify-center px-4 border-b border-border/50 overflow-hidden bg-background">
        <div className="flex items-center w-full">
          <h2 className="text-xl md:text-2xl font-bold tracking-widest text-primary font-heading uppercase truncate whitespace-nowrap">
            {state === "collapsed" ? "MIP" : "MIP ADMIN"}
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-background py-4 space-y-4">
        {sidebarGroups.map((group, gIdx) => (
          <SidebarGroup key={gIdx} className="py-0 px-3">
            {group.label && state !== "collapsed" && (
              <SidebarGroupLabel className="font-heading uppercase tracking-[0.18em] text-[10px] text-muted-foreground/60 mb-1.5 px-3">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))}
                      className="hover:text-primary transition-all duration-200 font-sans px-3 py-2 rounded-md hover:bg-muted/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-[11px] uppercase tracking-[0.14em] font-medium">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
