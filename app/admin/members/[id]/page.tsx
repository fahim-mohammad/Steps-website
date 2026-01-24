'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navbar from '@/components/navbar'
import AdminSidebar from '@/components/admin-sidebar'
import { Member, Contribution, Loan } from '@/lib/types'

interface MemberDetailPageProps {
  params: { id: string }
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemberData()
  }, [])

  const fetchMemberData = async () => {
    try {
      setLoading(true)
      
      // Fetch member details
      const memberResponse = await fetch(`/api/members/${params.id}`)
      const memberData = await memberResponse.json()
      setMember(memberData)

      // Fetch contributions
      const contributionsResponse = await fetch(
        `/api/contributions?memberId=${params.id}`
      )
      const contributionsData = await contributionsResponse.json()
      setContributions(contributionsData)

      // Fetch loans
      const loansResponse = await fetch(`/api/loans?memberId=${params.id}`)
      const loansData = await loansResponse.json()
      setLoans(loansData)
    } catch (error) {
      console.error('Error fetching member data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <div className="flex-1 p-6 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{member.full_name}</h1>
                <p className="text-gray-600 mt-2">{member.email}</p>
                <Badge className={getStatusColor(member.status)}>
                  {member.status}
                </Badge>
              </div>
              <Link href="/admin/members">
                <Button variant="outline">Back to Members</Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Contributed</p>
                <p className="text-2xl font-bold mt-2">
                  ${member.total_contributed.toFixed(2)}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Borrowed</p>
                <p className="text-2xl font-bold mt-2">
                  ${member.total_borrowed.toFixed(2)}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Member Since</p>
                <p className="text-2xl font-bold mt-2">
                  {new Date(member.join_date).toLocaleDateString()}
                </p>
              </Card>
            </div>

            {/* Member Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Member Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Full Name</p>
                  <p className="font-medium">{member.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-medium">{member.email}</p>
                </div>
                {member.phone && (
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <p className="font-medium">{member.phone}</p>
                  </div>
                )}
                {member.national_id && (
                  <div>
                    <p className="text-gray-600 text-sm">National ID</p>
                    <p className="font-medium">{member.national_id}</p>
                  </div>
                )}
                {member.address && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm">Address</p>
                    <p className="font-medium">{member.address}</p>
                  </div>
                )}
                {member.occupation && (
                  <div>
                    <p className="text-gray-600 text-sm">Occupation</p>
                    <p className="font-medium">{member.occupation}</p>
                  </div>
                )}
                {member.emergency_contact && (
                  <div>
                    <p className="text-gray-600 text-sm">Emergency Contact</p>
                    <p className="font-medium">{member.emergency_contact}</p>
                    {member.emergency_phone && (
                      <p className="text-sm text-gray-600">{member.emergency_phone}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="contributions">
              <TabsList>
                <TabsTrigger value="contributions">
                  Contributions ({contributions.length})
                </TabsTrigger>
                <TabsTrigger value="loans">
                  Loans ({loans.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contributions">
                <Card className="p-6">
                  {contributions.length === 0 ? (
                    <p className="text-gray-500">No contributions yet</p>
                  ) : (
                    <div className="space-y-4">
                      {contributions.map((contribution) => (
                        <div
                          key={contribution.id}
                          className="flex items-center justify-between border-b pb-4"
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
                          <Badge>{contribution.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="loans">
                <Card className="p-6">
                  {loans.length === 0 ? (
                    <p className="text-gray-500">No loans yet</p>
                  ) : (
                    <div className="space-y-4">
                      {loans.map((loan) => (
                        <div
                          key={loan.id}
                          className="flex items-center justify-between border-b pb-4"
                        >
                          <div>
                            <p className="font-medium">
                              ${loan.principal_amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {loan.loan_term_months} months •{' '}
                              {loan.interest_rate}% APR
                            </p>
                          </div>
                          <Badge>{loan.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
