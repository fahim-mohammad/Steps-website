'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  getMemberProfitHistory,
  getMemberTotalProfit,
  getProfitDistributionSummary,
  distributeMonthlyProfit,
} from '@/lib/profit-distribution'
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
import { TrendingUp, Loader, Gift } from 'lucide-react'

interface ProfitRecord {
  id: string
  member_id: string
  distribution_month: string
  profit_share: number
  member_contribution: number
  total_contributions: number
}

interface Summary {
  total_profit: number
  total_contributions: number
  member_count: number
  average_profit_per_member: number
  last_distribution: string | null
}

export default function ProfitDistributionPage() {
  const { isManager, isOwner, user } = useAuth()
  const [profits, setProfits] = useState<ProfitRecord[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [totalEarned, setTotalEarned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [distributing, setDistributing] = useState(false)
  const [showDistributeDialog, setShowDistributeDialog] = useState(false)
  const [profitAmount, setProfitAmount] = useState('')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      if (isManager || isOwner) {
        const [summaryData] = await Promise.all([getSummaryData()])
        setSummary(summaryData)
      } else {
        const [historyData, totalData] = await Promise.all([
          getMemberProfitHistory(user?.id || ''),
          getMemberTotalProfit(user?.id || ''),
        ])
        setProfits(historyData)
        setTotalEarned(totalData)
      }
    } catch (error) {
      console.error('Error loading profit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSummaryData = async (): Promise<Summary | null> => {
    try {
      const data = await getProfitDistributionSummary() as any
      if (Array.isArray(data) && data.length > 0) {
        // Convert array data to Summary format
        const first = data[0] as any
        return {
          total_profit: first.total_profit || 0,
          total_contributions: first.total_contributions || 0,
          member_count: first.members?.length || 0,
          average_profit_per_member: first.average_profit_per_member || 0,
          last_distribution: first.distribution_date || null
        }
      }
      return null
    } catch (error) {
      console.error('Error loading summary:', error)
      return null
    }
  }

  const handleDistribute = async () => {
    if (!user || !profitAmount) return

    try {
      setDistributing(true)
      const currentDate = new Date()
      const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      await distributeMonthlyProfit(monthYear, parseFloat(profitAmount), user.id)
      setProfitAmount('')
      setShowDistributeDialog(false)
      await loadData()
    } catch (error) {
      console.error('Error distributing profit:', error)
    } finally {
      setDistributing(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Card className="p-8 text-center">
            <p className="text-gray-600">Loading...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (isManager || isOwner) {
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
                  <h1 className="text-3xl font-bold">Profit Distribution</h1>
                  <p className="text-gray-600 mt-2">Manage and distribute monthly profits to members</p>
                </div>
                <Button onClick={() => setShowDistributeDialog(true)} className="gap-2">
                  <Gift size={18} />
                  Distribute Profit
                </Button>
              </div>

              {/* Summary Stats */}
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader className="animate-spin text-blue-600" size={32} />
                </div>
              ) : summary ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-6">
                      <p className="text-sm font-medium text-gray-600">Total Profit Distributed</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">৳{summary.total_profit.toLocaleString()}</p>
                    </Card>
                    <Card className="p-6">
                      <p className="text-sm font-medium text-gray-600">Total Contributions</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">৳{summary.total_contributions.toLocaleString()}</p>
                    </Card>
                    <Card className="p-6">
                      <p className="text-sm font-medium text-gray-600">Members</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">{summary.member_count}</p>
                    </Card>
                    <Card className="p-6">
                      <p className="text-sm font-medium text-gray-600">Avg Per Member</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">
                        ৳{summary.average_profit_per_member.toLocaleString()}
                      </p>
                    </Card>
                  </div>

                  {summary.last_distribution && (
                    <Card className="p-4 bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        Last distribution: <span className="font-medium">{new Date(summary.last_distribution).toLocaleDateString()}</span>
                      </p>
                    </Card>
                  )}
                </>
              ) : null}

              {/* Distribution History */}
              <Card className="overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold">Distribution History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Member</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Month</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Contribution</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Profit Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {profits.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                            No distributions yet
                          </td>
                        </tr>
                      ) : (
                        profits.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{record.member_id.slice(0, 8)}...</td>
                            <td className="px-6 py-4 text-gray-600">{record.distribution_month}</td>
                            <td className="px-6 py-4 text-right text-gray-900">
                              ৳{record.member_contribution.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-green-600">
                              ৳{record.profit_share.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Distribute Dialog */}
        {showDistributeDialog && (
          <AlertDialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Distribute Monthly Profit</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 mt-4">
                  <p className="text-sm text-gray-700">
                    Enter the total profit amount to distribute proportionally based on member contributions.
                  </p>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Total Profit Amount</label>
                    <input
                      type="number"
                      value={profitAmount}
                      onChange={(e) => setProfitAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="flex gap-2">
                <Button
                  onClick={handleDistribute}
                  disabled={distributing || !profitAmount}
                  className="flex-1"
                >
                  {distributing ? <Loader className="animate-spin mr-2" size={16} /> : null}
                  Distribute
                </Button>
                <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    )
  }

  // Member view
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">My Profit History</h1>
              <p className="text-gray-600 mt-2">View your profit earnings from fund distributions</p>
            </div>

            {/* Total Earned */}
            <Card className="p-8 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-medium text-sm">Total Profit Earned</p>
                  <p className="text-4xl font-bold text-green-900 mt-2">৳{totalEarned.toLocaleString()}</p>
                </div>
                <TrendingUp className="text-green-600" size={48} />
              </div>
            </Card>

            {/* Profit History */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold">Distribution Records</h2>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : profits.length === 0 ? (
                  <div className="text-center p-12 text-gray-600">
                    <p>No profit distributions yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Month</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Your Contribution</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Your Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {profits.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{record.distribution_month}</td>
                          <td className="px-6 py-4 text-right text-gray-600">
                            ৳{record.member_contribution.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            ৳{record.profit_share.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
