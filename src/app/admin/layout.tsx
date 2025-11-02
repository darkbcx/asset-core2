"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Users, Settings, Activity, Shield, LogOut, ChevronDown } from "lucide-react";
import { handleLogout } from "@/lib/auth";
import { useAuth } from "@/lib/providers/auth-provider";
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const onLogout = () => {
    handleLogout(router);
  };

  // Format user display values
  const userName = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`.trim() || "System Admin"
    : "System Admin";

  const userRoleDisplay = user?.system_role
    ? user.system_role
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "System Administrator";

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase().slice(0, 2) || "SA"
    : "SA";

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      title: "Companies",
      icon: Building2,
      href: "/admin/companies",
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Monitoring",
      icon: Activity,
      href: "/admin/monitoring",
    },
    {
      title: "System Settings",
      icon: Settings,
      href: "/admin/settings",
    },
    {
      title: "Security",
      icon: Shield,
      href: "/admin/security",
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">AssetCore</p>
              <p className="text-xs text-muted-foreground">System Admin</p>
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
          <h1 className="text-xl font-semibold">System Administration</h1>
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
                    <p className="text-xs text-muted-foreground truncate">{userRoleDisplay}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{userName}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {userRoleDisplay}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span>Switch to Tenant View</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator /> */}
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
