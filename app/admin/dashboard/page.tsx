'use client';

import { useState, useEffect } from 'react';
import { useRouteGuard } from '@/lib/use-route-guard';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Stats {
  totalMembers: number;
  approvedMembers: number;
  pendingMembers: number;
  totalContributions: number;
  totalLoans: number;
  activeLoanCount: number;
}

export default function AdminDashboardPage() {
  const { canAccess, isLoading } = useRouteGuard();
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    approvedMembers: 0,
    pendingMembers: 0,
    totalContributions: 0,
    totalLoans: 0,
    activeLoanCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (canAccess) {
      fetchStats();
    }
  }, [canAccess]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [membersRes, contributionsRes, loansRes] = await Promise.all([
        supabase.from('profiles').select('id, is_approved', { count: 'exact', head: false }),
        supabase.from('contributions').select('amount', { count: 'exact' }),
        supabase.from('loans').select('id, status, amount'),
      ]);

      const members = membersRes.data || [];
      const contributions = contributionsRes.data || [];
      const loans = loansRes.data || [];

      const approvedMembers = members.filter(m => m.is_approved).length;
      const pendingMembers = members.filter(m => !m.is_approved).length;
      const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
      const activeLoanCount = loans.filter(l => l.status === 'active' || l.status === 'approved').length;
      const totalLoans = loans.reduce((sum, l) => sum + (l.amount || 0), 0);

      setStats({
        totalMembers: members.length,
        approvedMembers,
        pendingMembers,
        totalContributions,
        totalLoans,
        activeLoanCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
          Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Here's what's happening in your STEPS fund today
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Members */}
          <Card className="border-blue-200 dark:border-blue-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalMembers}
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>✓ {stats.approvedMembers} Approved</span>
                <span>⏳ {stats.pendingMembers} Pending</span>
              </div>
            </CardContent>
          </Card>

          {/* Contributions */}
          <Card className="border-green-200 dark:border-green-900/30">
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
                From {stats.approvedMembers} active members
              </p>
            </CardContent>
          </Card>

          {/* Loans */}
          <Card className="border-orange-200 dark:border-orange-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.activeLoanCount}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Total value: ৳{stats.totalLoans.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⏳</span> Pending Approvals
            </CardTitle>
            <CardDescription className="text-amber-900 dark:text-amber-400">
              {stats.pendingMembers} member{stats.pendingMembers !== 1 ? 's' : ''} waiting for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/approve-members">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Review & Approve →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> Generate Reports
            </CardTitle>
            <CardDescription className="text-purple-900 dark:text-purple-400">
              Create financial summaries and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/reports">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                View Reports →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <Link href="/admin/members">
            <Button variant="outline" className="w-full">
              👥 Members
            </Button>
          </Link>
          <Link href="/admin/contributions">
            <Button variant="outline" className="w-full">
              💳 Contributions
            </Button>
          </Link>
          <Link href="/admin/loans">
            <Button variant="outline" className="w-full">
              💰 Loans
            </Button>
          </Link>
          {profile?.is_owner && (
            <Link href="/admin/accountant">
              <Button variant="outline" className="w-full">
                👑 Assign
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-slate-300 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p>• Review pending member approvals regularly to onboard new members</p>
          <p>• Monitor active loans to ensure timely repayments</p>
          <p>• Generate monthly reports for fund transparency</p>
          {profile?.is_owner && (
            <p>• Only you can assign the accountant role to trusted members</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
