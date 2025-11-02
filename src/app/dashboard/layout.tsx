"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, Wrench, BarChart3, Settings, LayoutDashboard, LogOut, Building2, ChevronDown, ArrowRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/providers/auth-provider";
import { handleLogout } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, companies, activeCompany, isLoading } = useAuth();

  const onLogout = () => {
    handleLogout(router);
  };

  // Helper functions to format display values
  // Handle loading state: show placeholder while loading, actual name when available
  const userName = isLoading
    ? "Loading..."
    : user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`.trim() || "User"
    : "User";

  // Calculate user initials, handle loading state
  const userInitials = isLoading
    ? "••"
    : user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase().slice(0, 2) || "U"
    : "U";

  const activeCompanyName = activeCompany?.company_name || null;
  const userRole = activeCompany?.role || "";

  const hasMultipleCompanies = companies.filter((c) => c.is_active !== false).length > 1;

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Assets",
      icon: Package,
      href: "/dashboard/assets",
    },
    {
      title: "Maintenance",
      icon: Wrench,
      href: "/dashboard/maintenance",
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">AssetCore</p>
              {activeCompanyName ? (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">{activeCompanyName}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Tenant Dashboard</p>
              )}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <main className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background px-4">
          <SidebarTrigger />
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col gap-0.5 items-start min-w-0">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    {userRole && (
                      <p className="text-xs text-muted-foreground truncate">
                        {userRole
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </p>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{userName}</div>
                    {userRole && (
                      <div className="text-xs text-muted-foreground font-normal">
                        {userRole
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </div>
                    )}
                    {activeCompanyName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-normal mt-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{activeCompanyName}</span>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hasMultipleCompanies && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/select-company" className="cursor-pointer">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span>Switch Company</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-muted/40 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
