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

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Navbar from '@/components/navbar'
import AdminSidebar from '@/components/admin-sidebar'
import { Member, Loan, Contribution } from '@/lib/types'

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch members
      const membersResponse = await fetch('/api/members')
      const membersData = await membersResponse.json()
      setMembers(membersData)

      // Fetch loans
      const loansResponse = await fetch('/api/loans')
      const loansData = await loansResponse.json()
      setLoans(loansData)

      // Fetch contributions for all members
      let allContributions: Contribution[] = []
      for (const member of membersData) {
        const response = await fetch(`/api/contributions?memberId=${member.id}`)
        const data = await response.json()
        allContributions = [...allContributions, ...data]
      }
      setContributions(allContributions)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalMembers = members.length
  const totalContributed = contributions
    .filter((c) => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)
  const totalLoansAmount = loans.reduce((sum, l) => sum + l.principal_amount, 0)
  const totalDisbursed = loans
    .filter((l) => l.status === 'disbursed' || l.status === 'active')
    .reduce((sum, l) => sum + l.principal_amount, 0)
  const activeLoans = loans.filter((l) => l.status === 'active').length
  const pendingLoans = loans.filter((l) => l.status === 'pending').length

  // Loan status chart data
  const loanStatusData = [
    {
      name: 'Pending',
      value: loans.filter((l) => l.status === 'pending').length,
    },
    {
      name: 'Approved',
      value: loans.filter((l) => l.status === 'approved').length,
    },
    {
      name: 'Disbursed',
      value: loans.filter((l) => l.status === 'disbursed').length,
    },
    {
      name: 'Active',
      value: loans.filter((l) => l.status === 'active').length,
    },
    {
      name: 'Completed',
      value: loans.filter((l) => l.status === 'completed').length,
    },
  ].filter((item) => item.value > 0)

  const COLORS = ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399', '#10b981']

  // Contribution period chart data
  const contributionData = [
    {
      name: 'Weekly',
      amount: contributions
        .filter((c) => c.period === 'weekly' && c.status === 'completed')
        .reduce((sum, c) => sum + c.amount, 0),
    },
    {
      name: 'Monthly',
      amount: contributions
        .filter((c) => c.period === 'monthly' && c.status === 'completed')
        .reduce((sum, c) => sum + c.amount, 0),
    },
    {
      name: 'Quarterly',
      amount: contributions
        .filter((c) => c.period === 'quarterly' && c.status === 'completed')
        .reduce((sum, c) => sum + c.amount, 0),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome to Steps Admin</p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Members</p>
                <p className="text-3xl font-bold mt-2">{totalMembers}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Active community members
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Contributed</p>
                <p className="text-3xl font-bold mt-2">
                  ${totalContributed.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Loans</p>
                <p className="text-3xl font-bold mt-2">
                  ${totalLoansAmount.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">{activeLoans} active</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold mt-2">{pendingLoans}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Status Chart */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Loan Status</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={loanStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {loanStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Contributions by Period */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Contributions by Period
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Quick Links */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/members/new">
                  <Button variant="outline" className="w-full">
                    Add Member
                  </Button>
                </Link>
                <Link href="/admin/loans/new">
                  <Button variant="outline" className="w-full">
                    Create Loan
                  </Button>
                </Link>
                <Link href="/admin/contributions/new">
                  <Button variant="outline" className="w-full">
                    Record Contribution
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full">
                    View Reports
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
    const approvedLoans = allLoans.filter((l) => l.status === 'approved' || l.status === 'active').length;
    const totalLoansAmount = allLoans.reduce((sum, l) => sum + l.amount, 0);

    setStats({
      totalMembers: allUsers.length,
      totalBalance,
      totalContributed,
      pendingLoans,
      approvedLoans,
      totalLoansAmount,
    });

    setRecentTransactions(allTransactions.slice(-8).reverse());
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-foreground/70">Manage your fund and members</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Members</h3>
              <p className="mt-2 text-3xl font-bold text-primary">{stats.totalMembers}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Fund Balance</h3>
              <p className="mt-2 text-3xl font-bold text-secondary">
                ৳{stats.totalBalance.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Contributed</h3>
              <p className="mt-2 text-3xl font-bold text-accent">
                ৳{stats.totalContributed.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Pending Loan Requests</h3>
              <p className="mt-2 text-3xl font-bold text-primary">{stats.pendingLoans}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Active Loans</h3>
              <p className="mt-2 text-3xl font-bold text-secondary">{stats.approvedLoans}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Loan Amount</h3>
              <p className="mt-2 text-3xl font-bold text-accent">
                ৳{stats.totalLoansAmount.toLocaleString()}
              </p>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/members">
                <Button className="gap-2">
                  <span>👥</span> Manage Members
                </Button>
              </Link>
              <Link href="/admin/loans">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <span>📋</span> Review Loans
                </Button>
              </Link>
              <Link href="/admin/contributions">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <span>💰</span> Verify Contributions
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <span>📊</span> View Reports
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
                      <th className="px-4 py-2 text-left text-foreground/70">User</th>
                      <th className="px-4 py-2 text-left text-foreground/70">Description</th>
                      <th className="px-4 py-2 text-right text-foreground/70">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((txn) => {
                      const user = allUsers.find((u) => u.id === txn.userId);
                      return (
                        <tr key={txn.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2">{txn.date}</td>
                          <td className="px-4 py-2 capitalize">{txn.type}</td>
                          <td className="px-4 py-2">{user?.name || 'Unknown'}</td>
                          <td className="px-4 py-2">{txn.description || '-'}</td>
                          <td className="px-4 py-2 text-right font-medium">
                            ৳{txn.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
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
