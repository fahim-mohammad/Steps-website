'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Navbar from '@/components/navbar'
import AdminSidebar from '@/components/admin-sidebar'
import { Loan, LoanPayment } from '@/lib/types'

interface LoanDetailPageProps {
  params: { id: string }
}

export default function LoanDetailPage({ params }: LoanDetailPageProps) {
  const router = useRouter()
  const [loan, setLoan] = useState<Loan | null>(null)
  const [payments, setPayments] = useState<LoanPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [disbursing, setDisbursing] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [addingPayment, setAddingPayment] = useState(false)

  useEffect(() => {
    fetchLoanData()
  }, [])

  const fetchLoanData = async () => {
    try {
      setLoading(true)
      const loanResponse = await fetch(`/api/loans/${params.id}`)
      const loanData = await loanResponse.json()
      setLoan(loanData)

      const paymentsResponse = await fetch(
        `/api/loan-payments?loanId=${params.id}`
      )
      const paymentsData = await paymentsResponse.json()
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error fetching loan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveLoan = async () => {
    if (!loan) return
    try {
      setApproving(true)
      const response = await fetch(`/api/loans/${loan.id}?action=approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'current-user-id' }), // Replace with actual user ID
      })
      if (response.ok) {
        const updatedLoan = await response.json()
        setLoan(updatedLoan)
      }
    } catch (error) {
      console.error('Error approving loan:', error)
    } finally {
      setApproving(false)
    }
  }

  const handleDisburseLoan = async () => {
    if (!loan) return
    try {
      setDisbursing(true)
      const response = await fetch(`/api/loans/${loan.id}?action=disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const updatedLoan = await response.json()
        setLoan(updatedLoan)
      }
    } catch (error) {
      console.error('Error disbursing loan:', error)
    } finally {
      setDisbursing(false)
    }
  }

  const handleAddPayment = async () => {
    if (!loan || !paymentAmount) return
    try {
      setAddingPayment(true)
      const paymentData = {
        loan_id: loan.id,
        payment_amount: parseFloat(paymentAmount),
        payment_date: new Date().toISOString().split('T')[0],
        status: 'completed',
      }
      const response = await fetch('/api/loan-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })
      if (response.ok) {
        setPaymentAmount('')
        fetchLoanData()
      }
    } catch (error) {
      console.error('Error adding payment:', error)
    } finally {
      setAddingPayment(false)
    }
  }

  if (loading || !loan) {
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'disbursed':
        return 'bg-purple-100 text-purple-800'
      case 'active':
        return 'bg-indigo-100 text-indigo-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'defaulted':
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
                <h1 className="text-3xl font-bold">
                  Loan: ${loan.principal_amount.toFixed(2)}
                </h1>
                <Badge className={`mt-2 ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </Badge>
              </div>
              <Link href="/admin/loans">
                <Button variant="outline">Back to Loans</Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Principal</p>
                <p className="text-2xl font-bold mt-2">
                  ${loan.principal_amount.toFixed(2)}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Interest Rate</p>
                <p className="text-2xl font-bold mt-2">{loan.interest_rate}%</p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Total Paid</p>
                <p className="text-2xl font-bold mt-2">
                  ${loan.total_paid.toFixed(2)}
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-gray-600 text-sm">Remaining</p>
                <p className="text-2xl font-bold mt-2">
                  ${loan.remaining_balance.toFixed(2)}
                </p>
              </Card>
            </div>

            {/* Loan Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Loan Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Term</p>
                  <p className="font-medium">{loan.loan_term_months} months</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Monthly Payment</p>
                  <p className="font-medium">
                    ${loan.monthly_payment?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Approved Date</p>
                  <p className="font-medium">
                    {loan.approved_date
                      ? new Date(loan.approved_date).toLocaleDateString()
                      : 'Not approved'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Disbursement Date</p>
                  <p className="font-medium">
                    {loan.disbursement_date
                      ? new Date(loan.disbursement_date).toLocaleDateString()
                      : 'Not disbursed'}
                  </p>
                </div>
                {loan.purpose && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-sm">Purpose</p>
                    <p className="font-medium">{loan.purpose}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              {loan.status === 'pending' && (
                <Button onClick={handleApproveLoan} disabled={approving}>
                  {approving ? 'Approving...' : 'Approve Loan'}
                </Button>
              )}
              {loan.status === 'approved' && (
                <Button onClick={handleDisburseLoan} disabled={disbursing}>
                  {disbursing ? 'Disbursing...' : 'Disburse Loan'}
                </Button>
              )}
            </div>

            {/* Add Payment */}
            {(loan.status === 'disbursed' || loan.status === 'active') && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                  <Button
                    onClick={handleAddPayment}
                    disabled={addingPayment || !paymentAmount}
                    className="mt-6"
                  >
                    {addingPayment ? 'Adding...' : 'Add Payment'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Payment History */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment History</h2>
              {payments.length === 0 ? (
                <p className="text-gray-500">No payments yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          ${payment.payment_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{payment.payment_method || '-'}</TableCell>
                        <TableCell>
                          <Badge>{payment.status}</Badge>
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
