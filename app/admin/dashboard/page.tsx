"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, DollarSign, LayoutDashboard, AlertCircle, Package, Wallet } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    withPlans: number;
    totalEarnings: number;
    totalRevenue: number;
    netProfit: number;
    totalWithdrawals: number;
    pendingWithdrawals: number;
    pendingWithdrawalsAmount: number;
    recentRegistrations: number;
  };
  adminTeam: {
    leftPV: number;
    rightPV: number;
    leftTeam: number;
    rightTeam: number;
    totalPV: number;
  };
  planDistribution: Record<string, number>;
  dailyReports: any[];
  incomeBreakdown: Record<string, number>;
  recentUsers: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/reports/dashboard');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<LayoutDashboard className="w-6 h-6 text-white" />}
        title="Admin Dashboard"
        subtitle="Overview of system performance and activity"
      />

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Users"
          value={String(stats?.overview?.totalUsers || 0)}
          icon={<Users className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
          trend={{ value: `${stats?.overview?.activeUsers || 0} active`, isPositive: true }}
        />
        <StatsCard
          label="Active Users"
          value={String(stats?.overview?.activeUsers || 0)}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: `${stats?.overview?.inactiveUsers || 0} inactive`, isPositive: false }}
        />
        <StatsCard
          label="With Plans"
          value={String(stats?.overview?.withPlans || 0)}
          icon={<Package className="w-6 h-6 text-purple-600" />}
          gradient="bg-purple-500"
          trend={{ value: "Active memberships", isPositive: true }}
        />
        <StatsCard
          label="Net Profit"
          value={`₹${(stats?.overview?.netProfit || 0).toLocaleString()}`}
          icon={<Wallet className="w-6 h-6 text-emerald-600" />}
          gradient="bg-emerald-500"
          trend={{ 
            value: `Revenue: ₹${(stats?.overview?.totalRevenue || 0).toLocaleString()}`, 
            isPositive: (stats?.overview?.netProfit || 0) > 0 
          }}
        />
      </div>

      {/* Admin Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Left PV</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.adminTeam?.leftPV || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Right PV</p>
              <p className="text-2xl font-bold text-indigo-600">{stats?.adminTeam?.rightPV || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Left Team</p>
              <p className="text-2xl font-bold text-green-600">{stats?.adminTeam?.leftTeam || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Right Team</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.adminTeam?.rightTeam || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-card border border-border rounded-xl shadow-sm mb-6">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Plan Distribution</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats?.planDistribution && Object.entries(stats.planDistribution).map(([plan, count]) => (
              <div key={plan} className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">{plan}</p>
                <p className="text-2xl font-bold text-foreground">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Referral ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm text-foreground">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{user.referralId}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No recent users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
