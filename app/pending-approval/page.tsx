'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/navbar'

export default function PendingApprovalPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [approvalStatus, setApprovalStatus] = useState<string>('pending')
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [approvalData, setApprovalData] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      checkMemberApproval()
      const interval = setInterval(checkMemberApproval, 3000) // Check every 3 seconds
      return () => clearInterval(interval)
    }
  }, [user, loading])

  const checkMemberApproval = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('approval_status, approved_by, approved_at')
        .eq('user_id', user?.id)
        .single()

      if (error) {
        console.error('Error checking approval status:', error)
        return
      }

      if (data) {
        setApprovalData(data)
        setApprovalStatus(data.approval_status)

        if (data.approval_status === 'approved') {
          setTimeout(() => {
            router.push('/member/dashboard')
          }, 1500)
        }
      }

      setCheckingStatus(false)
    } catch (error) {
      console.error('Error:', error)
      setCheckingStatus(false)
    }
  }

  if (loading || checkingStatus) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground/70">Checking approval status...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (approvalStatus === 'approved') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Approved!</h2>
              <p className="mt-2 text-sm text-foreground/70 mb-6">
                Your membership has been approved. Redirecting to your dashboard...
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (approvalStatus === 'rejected') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Application Rejected</h2>
              <p className="mt-2 text-sm text-foreground/70 mb-6">
                Unfortunately, your membership application has been rejected. Please contact the fund owner for more information.
              </p>
              <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                Back to Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 animate-pulse">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-foreground">Pending Approval</h1>

            <p className="mt-4 text-sm text-foreground/70">
              Thank you for signing up! Your membership application is under review.
            </p>

            <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                What happens next?
              </p>
              <ul className="text-xs text-foreground/70 space-y-2">
                <li>✓ The fund owner and manager will review your application</li>
                <li>✓ You will be notified once a decision is made</li>
                <li>✓ This page will automatically update when you are approved</li>
              </ul>
            </div>

            <div className="mt-6">
              <p className="text-xs text-foreground/60 mb-4">
                This page auto-refreshes every 3 seconds
              </p>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
