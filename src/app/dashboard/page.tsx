import { Package, Wrench, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  // Mock data for dashboard
  const stats = {
    totalAssets: 156,
    operationalAssets: 142,
    maintenanceAssets: 8,
    inactiveAssets: 6,
    totalComponents: 523,
    activeMaintenance: 12,
    completedThisMonth: 47,
    avgMTTR: "2.4 hrs",
  };

  const recentActivities = [
    { id: 1, type: "maintenance", asset: "AC-001", description: "Scheduled maintenance completed", time: "2 hours ago", status: "completed" },
    { id: 2, type: "maintenance", asset: "TR-042", description: "New maintenance request created", time: "5 hours ago", status: "pending" },
    { id: 3, type: "component", asset: "AC-012", description: "Component ENG-003 transferred", time: "1 day ago", status: "completed" },
    { id: 4, type: "asset", asset: "AC-023", description: "Asset status changed to operational", time: "2 days ago", status: "completed" },
  ];

  const upcomingMaintenance = [
    { id: 1, asset: "AC-001", component: "CFM56-7B Engine", type: "Scheduled", date: "2024-01-15", priority: "High" },
    { id: 2, asset: "TR-042", component: "Hydraulic System", type: "Scheduled", date: "2024-01-18", priority: "Medium" },
    { id: 3, asset: "AC-012", component: "Landing Gear", type: "Scheduled", date: "2024-01-20", priority: "Low" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalAssets}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Operational Assets */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Operational</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.operationalAssets}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Maintenance Required */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.maintenanceAssets}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Active Maintenance */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.activeMaintenance}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Activities</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  activity.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{activity.asset}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Maintenance</h2>
            <Wrench className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingMaintenance.map((item) => (
              <div key={item.id} className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.component}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{item.asset}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    item.priority === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Components</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.totalComponents}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed This Month</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.completedThisMonth}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg MTTR</p>
          <p className="text-2xl font-bold text-foreground mt-2">{stats.avgMTTR}</p>
        </div>
      </div>
    </div>
  );
}

