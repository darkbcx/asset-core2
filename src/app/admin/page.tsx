import { Building2, Users, Package, TrendingUp, Activity, Server } from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data for system administrator dashboard
  const platformStats = {
    totalCompanies: 42,
    activeCompanies: 38,
    totalUsers: 1250,
    activeUsers: 1080,
    totalAssets: 15600,
    totalMaintenanceRecords: 45200,
    systemUptime: "99.9%",
    apiRequests: "2.4M",
  };

  const recentCompanies = [
    { id: 1, name: "Acme Aviation", status: "active", users: 45, assets: 320, joinedDate: "2024-01-10" },
    { id: 2, name: "Global Manufacturing", status: "active", users: 128, assets: 890, joinedDate: "2024-01-08" },
    { id: 3, name: "Tech Fleet Solutions", status: "active", users: 32, assets: 210, joinedDate: "2024-01-05" },
    { id: 4, name: "Regional Transport Co", status: "trial", users: 8, assets: 45, joinedDate: "2024-01-12" },
  ];

  const systemEvents = [
    { id: 1, type: "info", message: "System backup completed successfully", time: "2 hours ago" },
    { id: 2, type: "warning", message: "High API request rate detected", time: "5 hours ago" },
    { id: 3, type: "success", message: "New company 'Regional Transport Co' created", time: "1 day ago" },
    { id: 4, type: "info", message: "Database optimization completed", time: "2 days ago" },
  ];

  const topCompanies = [
    { id: 1, name: "Global Manufacturing", assets: 890, users: 128, growth: "+12%" },
    { id: 2, name: "Acme Aviation", assets: 320, users: 45, growth: "+8%" },
    { id: 3, name: "Tech Fleet Solutions", assets: 210, users: 32, growth: "+5%" },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Companies</p>
              <p className="text-3xl font-bold text-foreground mt-2">{platformStats.totalCompanies}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{platformStats.activeCompanies} active</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-foreground mt-2">{platformStats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{platformStats.activeUsers.toLocaleString()} active</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Assets */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-3xl font-bold text-foreground mt-2">{platformStats.totalAssets.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all companies</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{platformStats.systemUptime}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Companies</h2>
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentCompanies.map((company) => (
              <div key={company.id} className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{company.name}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      company.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {company.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{company.users} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{company.assets} assets</span>
                    </div>
                    <span className="text-xs text-gray-400">Joined {company.joinedDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Events */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">System Events</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {systemEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{event.message}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats & Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Platform Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Requests</span>
              <span className="text-sm font-medium text-foreground">{platformStats.apiRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance Records</span>
              <span className="text-sm font-medium text-foreground">{platformStats.totalMaintenanceRecords.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Assets/Company</span>
              <span className="text-sm font-medium text-foreground">{Math.round(platformStats.totalAssets / platformStats.totalCompanies)}</span>
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top Companies by Assets</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topCompanies.map((company, index) => (
              <div key={company.id} className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{company.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{company.assets} assets</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{company.users} users</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{company.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

