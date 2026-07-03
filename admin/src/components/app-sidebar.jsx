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
  Mail,
  Shield,
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
      { title: "Subscribers", url: "/customers/subscribers", icon: Mail },
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
      <SidebarHeader className={`h-16 flex justify-center border-b border-border/50 bg-background transition-all duration-300 ${
        state === "collapsed" ? "px-0" : "px-4"
      }`}>
        <div className="flex items-center w-full justify-center">
          {state === "collapsed" ? (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/5 hover:bg-slate-900/10 transition-colors duration-205">
              <Shield className="w-4 h-4 text-amber-500 shrink-0 hover:rotate-12 transition-transform duration-300" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 w-full animate-in fade-in duration-200">
              <div className="p-1.5 bg-slate-900 rounded-lg shadow-sm shrink-0 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold tracking-widest text-slate-800 font-heading uppercase whitespace-nowrap leading-none">
                  MIP Atelier
                </span>
                <span className="text-[8px] font-sans font-bold text-amber-500 uppercase tracking-widest leading-none mt-1">
                  Admin Portal
                </span>
              </div>
            </div>
          )}
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
