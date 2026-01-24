'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin-sidebar'

interface PendingMember {
  id: string
  full_name: string
  email: string
  phone: string
  created_at: string
  approval_status: string
}

export default function ApproveMembersPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      router.push('/login')
      return
    }

    if (user && userRole === 'admin') {
      fetchPendingMembers()
    }
  }, [user, userRole, loading])

  const fetchPendingMembers = async () => {
    try {
      setLoadingMembers(true)
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, email, phone, created_at, approval_status')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingMembers(data || [])
    } catch (error) {
      console.error('Error fetching pending members:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleApproveMember = async (memberId: string) => {
    try {
      setApproving(memberId)
      const { error } = await supabase
        .from('members')
        .update({
          approval_status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', memberId)

      if (error) throw error

      setSuccessMessage('Member approved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Refresh list
      fetchPendingMembers()
    } catch (error) {
      console.error('Error approving member:', error)
    } finally {
      setApproving(null)
    }
  }

  const handleRejectMember = async (memberId: string) => {
    try {
      setRejecting(memberId)
      const { error } = await supabase
        .from('members')
        .update({
          approval_status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', memberId)

      if (error) throw error

      setSuccessMessage('Member rejected!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Refresh list
      fetchPendingMembers()
    } catch (error) {
      console.error('Error rejecting member:', error)
    } finally {
      setRejecting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Approve Members</h1>
            <p className="text-foreground/70">Review and approve pending membership applications</p>
          </div>

          {successMessage && (
            <Card className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
              <p className="text-sm text-green-700 dark:text-green-400">✓ {successMessage}</p>
            </Card>
          )}

          {loadingMembers ? (
            <Card className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-foreground/70">Loading pending members...</p>
            </Card>
          ) : pendingMembers.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-lg font-semibold text-foreground">No Pending Members</p>
              <p className="text-foreground/70">All applications have been reviewed</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingMembers.map((member) => (
                <Card key={member.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{member.full_name}</h3>
                      <p className="text-sm text-foreground/70">{member.email}</p>
                      <p className="text-sm text-foreground/70">{member.phone}</p>
                      <p className="text-xs text-foreground/50 mt-2">
                        Applied: {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveMember(member.id)}
                        disabled={approving === member.id || rejecting === member.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approving === member.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleRejectMember(member.id)}
                        disabled={approving === member.id || rejecting === member.id}
                        variant="destructive"
                      >
                        {rejecting === member.id ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
