import Link from "next/link";
import { LayoutDashboard, Building2, Users, Settings, Activity, Shield } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-foreground">AssetCore</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">System Admin</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/admin/companies"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Building2 className="h-5 w-5" />
              <span>Companies</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/monitoring"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Activity className="h-5 w-5" />
              <span>Monitoring</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>System Settings</span>
            </Link>
            <Link
              href="/admin/security"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span>Security</span>
            </Link>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">System Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Super Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6">
          <h1 className="text-2xl font-semibold text-foreground">System Administration</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors"
            >
              Switch to Tenant View
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}

