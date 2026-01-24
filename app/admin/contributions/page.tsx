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
