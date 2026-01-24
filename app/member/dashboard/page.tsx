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
      if (memberData.length > 0) {
        setMember(memberData[0])

        // Fetch contributions
        const contribResponse = await fetch(
          `/api/contributions?memberId=${memberData[0].id}`
        )
        const contribData = await contribResponse.json()
        setContributions(contribData)

        // Fetch loans
        const loansResponse = await fetch(
          `/api/loans?memberId=${memberData[0].id}`
        )
        const loansData = await loansResponse.json()
        setLoans(loansData)
      }
    } catch (error) {
      console.error('Error fetching member data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalContributed = contributions
    .filter((c) => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)
  const activeLoans = loans.filter((l) => l.status === 'active').length
  const totalBorrowed = loans.reduce((sum, l) => sum + l.principal_amount, 0)

  // Chart data
  const contributionChartData = contributions
    .filter((c) => c.status === 'completed')
    .slice(-6)
    .map((c) => ({
      date: new Date(c.contribution_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      amount: c.amount,
    }))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <MemberSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome, {member?.full_name || 'Member'}!
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <>
                {/* Key Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6">
                    <p className="text-gray-600 text-sm">Total Contributed</p>
                    <p className="text-3xl font-bold mt-2">
                      ${totalContributed.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {contributions.length} contributions
                    </p>
                  </Card>
                  <Card className="p-6">
                    <p className="text-gray-600 text-sm">Total Borrowed</p>
                    <p className="text-3xl font-bold mt-2">
                      ${totalBorrowed.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {activeLoans} active
                    </p>
                  </Card>
                  <Card className="p-6">
                    <p className="text-gray-600 text-sm">Member Since</p>
                    <p className="text-3xl font-bold mt-2">
                      {member && new Date(member.join_date).getFullYear()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {member &&
                        new Date(member.join_date).toLocaleDateString()}
                    </p>
                  </Card>
                </div>

                {/* Charts */}
                {contributionChartData.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Contribution History
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={contributionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Recent Contributions */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Contributions</h2>
                    <Link href="/member/contributions">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                  {contributions.length === 0 ? (
                    <p className="text-gray-500">No contributions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {contributions.slice(-5).map((contribution) => (
                        <div
                          key={contribution.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <p className="font-medium">
                              ${contribution.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                contribution.contribution_date
                              ).toLocaleDateString()}{' '}
                              • {contribution.period}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {contribution.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Active Loans */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Active Loans</h2>
                    <Link href="/member/loans">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                  {loans.filter((l) => l.status === 'active').length === 0 ? (
                    <p className="text-gray-500">No active loans</p>
                  ) : (
                    <div className="space-y-2">
                      {loans
                        .filter((l) => l.status === 'active')
                        .map((loan) => (
                          <div
                            key={loan.id}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div>
                              <p className="font-medium">
                                ${loan.principal_amount.toFixed(2)} @{' '}
                                {loan.interest_rate}%
                              </p>
                              <p className="text-sm text-gray-600">
                                Remaining: ${loan.remaining_balance.toFixed(2)}
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/member/contributions">
                      <Button variant="outline" className="w-full">
                        My Contributions
                      </Button>
                    </Link>
                    <Link href="/member/loans">
                      <Button variant="outline" className="w-full">
                        My Loans
                      </Button>
                    </Link>
                    <Link href="/member/profile">
                      <Button variant="outline" className="w-full">
                        My Profile
                      </Button>
                    </Link>
                    <Link href="/member/transactions">
                      <Button variant="outline" className="w-full">
                        Transactions
                      </Button>
                    </Link>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
    setRecentTransactions(transactions.slice(-5).reverse());
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <MemberSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}!</h1>
            <p className="mt-2 text-foreground/70">Your fund overview and recent activity</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Current Balance</h3>
              <p className="mt-2 text-3xl font-bold text-primary">৳{stats.totalBalance.toLocaleString()}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Contributed</h3>
              <p className="mt-2 text-3xl font-bold text-secondary">৳{stats.totalContributed.toLocaleString()}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Active Loans</h3>
              <p className="mt-2 text-3xl font-bold text-accent">{stats.activeLoans}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Fund Members</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">5</p>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/member/contributions">
                <Button className="gap-2">
                  <span>💰</span> Make Contribution
                </Button>
              </Link>
              <Link href="/member/loans">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <span>📋</span> Request Loan
                </Button>
              </Link>
              <Link href="/member/profile">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <span>👤</span> Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Transactions */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <p className="text-foreground/70">No transactions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left text-foreground/70">Date</th>
                      <th className="px-4 py-2 text-left text-foreground/70">Type</th>
                      <th className="px-4 py-2 text-left text-foreground/70">Description</th>
                      <th className="px-4 py-2 text-right text-foreground/70">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2">{txn.date}</td>
                        <td className="px-4 py-2 capitalize">{txn.type}</td>
                        <td className="px-4 py-2">{txn.description || '-'}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          +৳{txn.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
