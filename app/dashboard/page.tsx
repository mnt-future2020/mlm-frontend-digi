"use client";

import { Users, TrendingUp, Wallet, Gift, UserPlus, CreditCard, Share2, Copy, Check } from "lucide-react";
import { PageContainer, PageHeader, StatsCard } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/api";
import { KYCBanner } from "@/components/kyc-banner";

// Helper function to format date in IST
const formatDateIST = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

interface DashboardData {
  wallet: {
    balance: number;
    totalEarnings: number;
    totalWithdrawals: number;
    todaysEarnings: number;
    pendingWithdrawals: number;
    referralIncome: number;
    matchingIncome: number;
  };
  team: {
    total: number;
    left: number;
    right: number;
    leftPV: number;
    rightPV: number;
    totalPV: number;
  };
  currentPlan: any;
  rank?: {
    name: string;
    icon: string;
    color: string;
    minPV: number;
  };
  recentTransactions: any[];
}

export default function UserDashboard() {
  const { user, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Referral Copy States
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosInstance.get('/api/user/dashboard');
        if (response.data.success) {
          const data = response.data.data;
          setDashboardData(data);

          // Check if user status has changed (e.g. KYC approved)
          if (user && (
            data.kycStatus !== user.kycStatus ||
            data.isActive !== user.isActive
          )) {
            console.log("User status changed, refreshing profile...");
            refreshUser();
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [user, refreshUser]);

  const copyLink = (placement: 'LEFT' | 'RIGHT') => {
    if (!user?.referralId) return;
    const link = `${window.location.origin}/register?ref=${user.referralId}&place=${placement}`;
    navigator.clipboard.writeText(link);
    if (placement === 'LEFT') {
      setCopiedLeft(true);
      setTimeout(() => setCopiedLeft(false), 2000);
    } else {
      setCopiedRight(true);
      setTimeout(() => setCopiedRight(false), 2000);
    }
  };

  const shareOnWhatsApp = (placement: 'LEFT' | 'RIGHT') => {
    if (!user?.referralId) return;
    const link = `${window.location.origin}/register?ref=${user.referralId}&place=${placement}`;
    const text = `Join my team on VSV Unite! Register here: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <PageContainer maxWidth="2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<TrendingUp className="w-6 h-6 text-white" />}
        title={`Welcome back, ${user?.name || 'User'}!`}
        subtitle="Here's what's happening with your account today."
      />

      {/* KYC Banner */}
      <KYCBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          label="Total Earnings"
          value={`₹${dashboardData?.wallet?.totalEarnings || 0}`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          gradient="bg-green-500"
          trend={{ value: "Lifetime earnings", isPositive: true }}
        />
        <StatsCard
          label="Today's Earnings"
          value={`₹${dashboardData?.wallet?.todaysEarnings || 0}`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          gradient="bg-emerald-500"
          trend={{ value: "Earned today", isPositive: true }}
        />
        <StatsCard
          label="Available Balance"
          value={`₹${dashboardData?.wallet?.balance || 0}`}
          icon={<Wallet className="w-6 h-6 text-primary-600" />}
          gradient="bg-primary-500"
          trend={{ value: "Ready to withdraw", isPositive: true }}
        />
        <StatsCard
          label="Left PV"
          value={String(dashboardData?.team?.leftPV || 0)}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          gradient="bg-blue-500"
          trend={{ value: "Left leg volume", isPositive: true }}
        />
        <StatsCard
          label="Right PV"
          value={String(dashboardData?.team?.rightPV || 0)}
          icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
          gradient="bg-indigo-500"
          trend={{ value: "Right leg volume", isPositive: true }}
        />
        <StatsCard
          label="Current Plan"
          value={dashboardData?.currentPlan?.name || "No Plan"}
          icon={<Gift className="w-6 h-6 text-pink-600" />}
          gradient="bg-pink-500"
          trend={{ value: dashboardData?.currentPlan ? `${dashboardData.currentPlan.pv} PV` : "Activate a plan", isPositive: true }}
        />
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Left Team</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData?.team?.left || 0}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Left PV</p>
              <p className="text-lg font-semibold text-blue-600">{dashboardData?.team?.leftPV || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Right Team</p>
                <p className="text-2xl font-bold text-foreground">{dashboardData?.team?.right || 0}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Right PV</p>
              <p className="text-lg font-semibold text-indigo-600">{dashboardData?.team?.rightPV || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Card */}
      {dashboardData?.rank && (
        <div className="mb-8">
          <div className="bg-card border-2 border-border rounded-xl p-6 shadow-lg" style={{ borderColor: dashboardData.rank.color }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Current Rank</p>
              <span className="text-3xl">{dashboardData.rank.icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: dashboardData.rank.color }}>
              {dashboardData.rank.name}
            </h3>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total PV Earned</p>
                <p className="text-lg font-bold text-foreground">{dashboardData?.team?.totalPV || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Minimum Required</p>
                <p className="text-lg font-semibold" style={{ color: dashboardData.rank.color }}>{dashboardData.rank.minPV} PV</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral Links Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white mb-8">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" /> Referral Center
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Link */}
          <div>
            <p className="text-sm text-indigo-100 mb-2">Left Team Link</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => copyLink('LEFT')}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {copiedLeft ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                Copy
              </Button>
              <Button
                size="sm"
                onClick={() => shareOnWhatsApp('LEFT')}
                className="bg-green-500 hover:bg-green-600 text-white border-0"
              >
                <Share2 className="w-4 h-4" /> Whatsapp
              </Button>
            </div>
          </div>

          {/* Right Link */}
          <div>
            <p className="text-sm text-indigo-100 mb-2">Right Team Link</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => copyLink('RIGHT')}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {copiedRight ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                Copy
              </Button>
              <Button
                size="sm"
                onClick={() => shareOnWhatsApp('RIGHT')}
                className="bg-green-500 hover:bg-green-600 text-white border-0"
              >
                <Share2 className="w-4 h-4" /> Whatsapp
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/top-up" className="w-full">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 shadow-sm">
                <CreditCard className="w-6 h-6" />
                <span>Upgrade Plan</span>
              </Button>
            </Link>
            <Link href="/dashboard/new-member" className="w-full">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                <UserPlus className="w-6 h-6" />
                <span>Invite Member</span>
              </Button>
            </Link>
            <Link href="/dashboard/payout-reports" className="w-full sm:col-span-2">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 shadow-sm">
                <Wallet className="w-6 h-6" />
                <span>Request Withdrawal</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.slice(0, 4).map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      transaction.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {transaction.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{transaction.type || transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateIST(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
