'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Navbar from '@/components/navbar'
import AdminSidebar from '@/components/admin-sidebar'
import { Contribution, Member } from '@/lib/types'

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [statusFilter, periodFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch all members and their contributions
      const membersResponse = await fetch('/api/members')
      const membersData = await membersResponse.json()
      setMembers(membersData)

      // Fetch all contributions (in a real app, you'd paginate this)
      let allContributions: Contribution[] = []
      for (const member of membersData) {
        const response = await fetch(`/api/contributions?memberId=${member.id}`)
        const data = await response.json()
        allContributions = [...allContributions, ...data]
      }

      // Apply filters
      let filtered = allContributions
      if (statusFilter !== 'all') {
        filtered = filtered.filter((c) => c.status === statusFilter)
      }
      if (periodFilter !== 'all') {
        filtered = filtered.filter((c) => c.period === periodFilter)
      }

      setContributions(filtered.sort((a, b) => 
        new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime()
      ))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reversed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    return member?.full_name || 'Unknown'
  }

  const totalContributed = contributions
    .filter((c) => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Contributions</h1>
                <p className="text-gray-600 mt-2">
                  Total contributed: ${totalContributed.toFixed(2)}
                </p>
              </div>
              <Link href="/admin/contributions/new">
                <Button>Record Contribution</Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="p-4 flex gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="reversed">Reversed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Period</label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Contributions Table */}
            <Card className="overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : contributions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No contributions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((contribution) => (
                      <TableRow key={contribution.id}>
                        <TableCell className="font-medium">
                          {getMemberName(contribution.member_id)}
                        </TableCell>
                        <TableCell>
                          ${contribution.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            contribution.contribution_date
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {contribution.period}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(contribution.status)}>
                            {contribution.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contribution.payment_method || '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
    const updatedContributions = contributions.map((contrib) => {
      if (contrib.id === contributionId) {
        const updated = {
          ...contrib,
          verified: true,
          verifiedBy: currentUser?.id,
        };
        saveContribution(updated);
        return updated;
      }
      return contrib;
    });
    setContributions(updatedContributions);
  };

  if (loading || !currentUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const pendingContributions = contributions.filter((c) => !c.verified);
  const verifiedContributions = contributions.filter((c) => c.verified);
  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Contributions</h1>
            <p className="mt-2 text-foreground/70">Verify and manage member contributions</p>
          </div>

          {/* Summary Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Contributions</h3>
              <p className="mt-2 text-3xl font-bold text-primary">
                ৳{totalAmount.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Verified</h3>
              <p className="mt-2 text-3xl font-bold text-secondary">{verifiedContributions.length}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Pending Verification</h3>
              <p className="mt-2 text-3xl font-bold text-accent">{pendingContributions.length}</p>
            </Card>
          </div>

          {/* Pending Contributions */}
          {pendingContributions.length > 0 && (
            <Card className="mb-6 p-6">
              <h2 className="mb-6 text-lg font-bold text-foreground">Pending Verification</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-foreground/70">Member</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Date</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Month</th>
                      <th className="px-4 py-3 text-right text-foreground/70">Amount</th>
                      <th className="px-4 py-3 text-center text-foreground/70">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingContributions.map((contrib) => {
                      const member = getUsers().find((u) => u.id === contrib.userId);
                      return (
                        <tr key={contrib.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{member?.name || 'Unknown'}</td>
                          <td className="px-4 py-3">{contrib.date}</td>
                          <td className="px-4 py-3">{contrib.month}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            ৳{contrib.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              onClick={() => handleVerifyContribution(contrib.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Verify
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* All Contributions */}
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-bold text-foreground">All Contributions</h2>

            {contributions.length === 0 ? (
              <p className="text-foreground/70">No contributions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-foreground/70">Member</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Date</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Month</th>
                      <th className="px-4 py-3 text-right text-foreground/70">Amount</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((contrib) => {
                      const member = getUsers().find((u) => u.id === contrib.userId);
                      return (
                        <tr key={contrib.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{member?.name || 'Unknown'}</td>
                          <td className="px-4 py-3">{contrib.date}</td>
                          <td className="px-4 py-3">{contrib.month}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            ৳{contrib.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                contrib.verified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {contrib.verified ? 'Verified' : 'Pending'}
                            </span>
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
