'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAllLoanApplications, updateLoanStatus } from '@/lib/loan-service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Navbar from '@/components/navbar'
import AdminSidebar from '@/components/admin-sidebar'
import { Check, X, Send, Loader, DollarSign } from 'lucide-react'

interface LoanApp {
  id: string
  applicant_id: string
  amount_requested: number
  amount_approved?: number
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid'
  created_at: string
  profiles: {
    full_name: string
    email: string
    phone: string
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  disbursed: 'bg-green-100 text-green-800',
  repaid: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  disbursed: 'Disbursed',
  repaid: 'Repaid',
}

export default function LoansPage() {
  const { isManager, isOwner, user } = useAuth()
  const [loans, setLoans] = useState<LoanApp[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLoan, setSelectedLoan] = useState<LoanApp | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [approvalAmount, setApprovalAmount] = useState('')

  useEffect(() => {
    if (!user) return
    loadLoans()
  }, [user])

  const loadLoans = async () => {
    try {
      setLoading(true)
      const data = await getAllLoanApplications(user?.id || '')
      setLoans(data)
    } catch (error) {
      console.error('Error loading loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedLoan) return
    try {
      setActionLoading(true)
      await updateLoanStatus(
        selectedLoan.id,
        'approved',
        user?.id || '',
        parseFloat(approvalAmount)
      )
      setLoans(
        loans.map((l) =>
          l.id === selectedLoan.id
            ? { ...l, status: 'approved' as const, amount_approved: parseFloat(approvalAmount) }
            : l
        )
      )
      setSelectedLoan(null)
      setApprovalAmount('')
    } catch (error) {
      console.error('Error approving loan:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedLoan) return
    try {
      setActionLoading(true)
      await updateLoanStatus(selectedLoan.id, 'rejected', user?.id || '')
      setLoans(loans.map((l) => (l.id === selectedLoan.id ? { ...l, status: 'rejected' as const } : l)))
      setSelectedLoan(null)
    } catch (error) {
      console.error('Error rejecting loan:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (!isManager && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="p-8 text-center">
              <h1 className="text-2xl font-bold text-red-900">Access Denied</h1>
              <p className="text-red-700 mt-2">Only managers and owners can approve loans.</p>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const pendingCount = loans.filter((l) => l.status === 'pending').length
  const approvedCount = loans.filter((l) => l.status === 'approved').length
  const totalRequested = loans.reduce((sum, l) => sum + l.amount_requested, 0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Loan Applications</h1>
              <p className="text-gray-600 mt-2">Review and manage member loan requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{approvedCount}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm font-medium text-gray-600">Total Requested</p>
                <p className="text-3xl font-bold text-green-600 mt-2">৳{totalRequested.toLocaleString()}</p>
              </Card>
            </div>

            {/* Loans Table */}
            <Card className="overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader className="animate-spin text-blue-600" size={32} />
                </div>
              ) : loans.length === 0 ? (
                <div className="text-center p-12 text-gray-600">
                  <p className="text-lg">No loan applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Member</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{loan.profiles.full_name}</p>
                            <p className="text-sm text-gray-600">{loan.profiles.email}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            ৳{loan.amount_requested.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={statusColors[loan.status]}>
                              {statusLabels[loan.status]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(loan.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {loan.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedLoan(loan)
                                  setApprovalAmount(loan.amount_requested.toString())
                                }}
                              >
                                Review
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {selectedLoan && (
        <AlertDialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Review Loan Application</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Member</p>
                  <p className="text-gray-900">{selectedLoan.profiles.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Amount Requested</p>
                  <p className="text-lg font-bold text-gray-900">৳{selectedLoan.amount_requested.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Approval Amount</label>
                  <input
                    type="number"
                    value={approvalAmount}
                    onChange={(e) => setApprovalAmount(e.target.value)}
                    max={selectedLoan.amount_requested}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? <Loader className="animate-spin mr-2" size={16} /> : <X size={16} className="mr-2" />}
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={actionLoading || !approvalAmount} className="flex-1">
                {actionLoading ? <Loader className="animate-spin mr-2" size={16} /> : <Check size={16} className="mr-2" />}
                Approve
              </Button>
            </div>

            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
