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

export default function NewContributionPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    contribution_date: new Date().toISOString().split('T')[0],
    period: 'monthly',
    payment_method: 'cash',
    notes: '',
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

  const handlePeriodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, period: value as any }))
  }

  const handleMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, payment_method: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.member_id || !formData.amount) {
        setError('Member and amount are required')
        setLoading(false)
        return
      }

      const contributionData = {
        member_id: formData.member_id,
        amount: parseFloat(formData.amount),
        contribution_date: formData.contribution_date,
        period: formData.period,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
        status: 'completed',
      }

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contributionData),
      })

      if (!response.ok) {
        throw new Error('Failed to record contribution')
      }

      router.push('/admin/contributions')
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
              <h1 className="text-3xl font-bold">Record Contribution</h1>
              <p className="text-gray-600 mt-2">
                Record a new contribution from a member
              </p>
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

                {/* Contribution Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contribution_date">Date *</Label>
                    <Input
                      id="contribution_date"
                      name="contribution_date"
                      type="date"
                      value={formData.contribution_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Period *</Label>
                    <Select value={formData.period} onValueChange={handlePeriodChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={handleMethodChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any notes about this contribution"
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Recording...' : 'Record Contribution'}
                  </Button>
                  <Link href="/admin/contributions">
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
