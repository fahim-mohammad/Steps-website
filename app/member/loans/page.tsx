'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getMemberLoans, applyForLoan, canMemberApplyForLoan, getMaxLoanAmount } from '@/lib/loan-service'
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
import MemberSidebar from '@/components/member-sidebar'
import { Plus, Loader, CheckCircle, AlertCircle } from 'lucide-react'

interface Loan {
  id: string
  applicant_id: string
  amount_requested: number
  amount_approved?: number
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid'
  created_at: string
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

export default function MemberLoansPage() {
  const { user, profile } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [maxAmount, setMaxAmount] = useState(0)
  const [canApply, setCanApply] = useState(false)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load loans
      const loansData = await getMemberLoans(user?.id || '')
      setLoans(loansData)

      // Check eligibility
      const [eligible, max] = await Promise.all([
        canMemberApplyForLoan(user?.id || ''),
        getMaxLoanAmount(user?.id || ''),
      ])
      setCanApply(eligible)
      setMaxAmount(max)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load loan data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !amount) return

    try {
      setFormLoading(true)
      setError(null)
      await applyForLoan(user.id, parseFloat(amount))
      setAmount('')
      setShowForm(false)
      await loadData()
    } catch (error) {
      console.error('Error submitting loan:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit loan application')
    } finally {
      setFormLoading(false)
    }
  }

  const pendingLoans = loans.filter((l) => l.status === 'pending').length
  const approvedLoans = loans.filter((l) => l.status === 'approved').length
  const totalRequested = loans.reduce((sum, l) => sum + l.amount_requested, 0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <MemberSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Loans</h1>
                <p className="text-gray-600 mt-2">Manage your loan applications and track status</p>
              </div>
              {canApply && (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus size={18} />
                  Apply for Loan
                </Button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <Card className="p-4 bg-red-50 border border-red-200">
                <p className="text-red-800">{error}</p>
              </Card>
            )}

            {/* Eligibility Warning */}
            {!canApply && !loading && (
              <Card className="p-4 bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-1" size={20} />
                <div>
                  <p className="font-medium text-yellow-900">Cannot Apply for Loan</p>
                  <p className="text-yellow-800 text-sm">You have pending loan applications or need minimum contributions.</p>
                </div>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingLoans}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{approvedLoans}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm font-medium text-gray-600">Total Requested</p>
                <p className="text-3xl font-bold text-green-600 mt-2">৳{totalRequested.toLocaleString()}</p>
              </Card>
            </div>

            {/* Loans List */}
            <Card className="overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader className="animate-spin text-blue-600" size={32} />
                </div>
              ) : loans.length === 0 ? (
                <div className="text-center p-12">
                  <p className="text-gray-600 text-lg">No loan applications yet</p>
                  {canApply && (
                    <Button onClick={() => setShowForm(true)} className="mt-4" variant="outline">
                      <Plus size={18} className="mr-2" />
                      Apply Now
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Approved</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            ৳{loan.amount_requested.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {loan.amount_approved ? (
                              <p className="font-semibold text-gray-900">৳{loan.amount_approved.toLocaleString()}</p>
                            ) : (
                              <p className="text-gray-500">-</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={statusColors[loan.status]}>{statusLabels[loan.status]}</Badge>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(loan.created_at).toLocaleDateString()}
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

      {/* Application Form Dialog */}
      {showForm && (
        <AlertDialog open={showForm} onOpenChange={setShowForm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply for Loan</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Maximum Loan Amount</p>
                  <p className="text-lg font-bold text-gray-900">৳{maxAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1">Based on 3x your approved contributions</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Loan Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      max={maxAmount}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {parseFloat(amount) > maxAmount && (
                      <p className="text-xs text-red-600 mt-1">Amount exceeds maximum</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={formLoading || !amount || parseFloat(amount) > maxAmount} className="flex-1">
                      {formLoading ? <Loader className="animate-spin mr-2" size={16} /> : null}
                      Submit Application
                    </Button>
                    <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                  </div>
                </form>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
