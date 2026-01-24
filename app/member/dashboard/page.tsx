'use client';

import { useState, useEffect } from 'react';
import { useRouteGuard } from '@/lib/use-route-guard';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MemberStats {
  totalContributions: number;
  contributionCount: number;
  totalLoans: number;
  activeLoanCount: number;
  monthlyData: Array<{ month: string; contribution: number }>;
}

export default function MemberDashboardPage() {
  const { canAccess, isLoading } = useRouteGuard();
  const { profile } = useAuth();
  const [stats, setStats] = useState<MemberStats>({
    totalContributions: 0,
    contributionCount: 0,
    totalLoans: 0,
    activeLoanCount: 0,
    monthlyData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (canAccess && profile?.id) {
      fetchStats();
    }
  }, [canAccess, profile?.id]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      if (!profile?.id) return;

      // Fetch contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount, created_at')
        .eq('member_id', profile.id);

      // Fetch loans
      const { data: loans } = await supabase
        .from('loans')
        .select('amount, status, created_at')
        .eq('member_id', profile.id);

      const totalContributions = contributions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      const activeLoanCount = loans?.filter(l => l.status === 'active' || l.status === 'approved').length || 0;
      const totalLoans = loans?.reduce((sum, l) => sum + (l.amount || 0), 0) || 0;

      // Calculate monthly data (last 6 months)
      const monthlyData = getMonthlyData(contributions || []);

      setStats({
        totalContributions,
        contributionCount: contributions?.length || 0,
        totalLoans,
        activeLoanCount,
        monthlyData,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyData = (contributions: any[]) => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    return months.map(month => ({
      month,
      contribution: contributions
        .filter(c => new Date(c.created_at).toLocaleDateString('en-US', { month: 'short' }) === month)
        .reduce((sum, c) => sum + (c.amount || 0), 0),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have access to this page. Contact your fund administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome, {profile?.full_name}! 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Track your contributions and loan activity
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-0">
          ✓ Verified Member
        </Badge>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You're an active member of the STEPS fund
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ৳{stats.totalContributions.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {stats.contributionCount} contribution{stats.contributionCount !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.activeLoanCount}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Total: ৳{stats.totalLoans.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Active ✓
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Fund Participation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                100%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Eligible for all programs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {stats.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contribution Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `৳${value}`} />
                <Bar dataKey="contribution" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <Link href="/member/contributions">
            <Button variant="outline" className="w-full">
              💳 Contribute
            </Button>
          </Link>
          <Link href="/member/loans">
            <Button variant="outline" className="w-full">
              💰 Request Loan
            </Button>
          </Link>
          <Link href="/member/transactions">
            <Button variant="outline" className="w-full">
              📊 History
            </Button>
          </Link>
          <Link href="/member/profile">
            <Button variant="outline" className="w-full">
              ⚙️ Settings
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-400">ℹ️ Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 dark:text-blue-400 space-y-2 text-sm">
          <p>
            • Check your profile for account details
          </p>
          <p>
            • View transaction history anytime
          </p>
          <p>
            • Request loans based on your contribution level
          </p>
          <p>
            • Contact the fund manager for assistance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
