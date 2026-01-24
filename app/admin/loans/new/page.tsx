'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Navbar from '@/components/navbar'
import AdminSidebar from '@/components/admin-sidebar'
import { Member } from '@/lib/types'

export default function NewLoanPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    member_id: '',
    principal_amount: '',
    interest_rate: '',
    loan_term_months: '',
    purpose: '',
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMemberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, member_id: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (
        !formData.member_id ||
        !formData.principal_amount ||
        !formData.interest_rate ||
        !formData.loan_term_months
      ) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const loanData = {
        member_id: formData.member_id,
        principal_amount: parseFloat(formData.principal_amount),
        interest_rate: parseFloat(formData.interest_rate),
        loan_term_months: parseInt(formData.loan_term_months),
        purpose: formData.purpose,
        status: 'pending',
        total_paid: 0,
        remaining_balance: parseFloat(formData.principal_amount),
      }

      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData),
      })

      if (!response.ok) {
        throw new Error('Failed to create loan')
      }

      router.push('/admin/loans')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Create New Loan</h1>
              <p className="text-gray-600 mt-2">Create a loan for a member</p>
            </div>

            {/* Form Card */}
            <Card className="p-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Member Selection */}
                <div>
                  <Label htmlFor="member_id">Select Member *</Label>
                  <Select value={formData.member_id} onValueChange={handleMemberChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name} ({member.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="principal_amount">
                      Principal Amount ($) *
                    </Label>
                    <Input
                      id="principal_amount"
                      name="principal_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.principal_amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest_rate">
                      Annual Interest Rate (%) *
                    </Label>
                    <Input
                      id="interest_rate"
                      name="interest_rate"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.interest_rate}
                      onChange={handleChange}
                      placeholder="0.0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan_term_months">
                      Loan Term (Months) *
                    </Label>
                    <Input
                      id="loan_term_months"
                      name="loan_term_months"
                      type="number"
                      min="1"
                      value={formData.loan_term_months}
                      onChange={handleChange}
                      placeholder="12"
                      required
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <Label htmlFor="purpose">Purpose of Loan</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Describe the purpose of this loan"
                    rows={4}
                  />
                </div>

                {/* Calculated Info */}
                {formData.principal_amount &&
                  formData.interest_rate &&
                  formData.loan_term_months && (
                    <Card className="p-4 bg-blue-50">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Estimated Monthly Payment:</p>
                        <p className="text-2xl font-bold">
                          ${(
                            (parseFloat(formData.principal_amount) *
                              (1 +
                                (parseFloat(formData.interest_rate) / 100) *
                                  (parseInt(formData.loan_term_months) / 12))) /
                            parseInt(formData.loan_term_months)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  )}

                {/* Actions */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Loan'}
                  </Button>
                  <Link href="/admin/loans">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
