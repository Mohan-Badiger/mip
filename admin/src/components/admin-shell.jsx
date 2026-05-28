"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { AdminLoginPage } from "@/components/admin-login-page";

function AuthGate({ children }) {
  const { user, isMounted } = useAuth();

  if (!isMounted) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tracking-[0.2em] uppercase text-[#736B66] font-bold">
            Loading Console...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full">
        <AdminLoginPage />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 w-full max-w-480 mx-auto p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export function AdminShell({ children }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
