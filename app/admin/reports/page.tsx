'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  getContributionReport,
  getLoanReport,
  getProfitDistributionReport,
  downloadReportAsCSV,
} from '@/lib/report-service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Navbar from '@/components/navbar'
import AdminSidebar from '@/components/admin-sidebar'
import { Download, Loader, Calendar } from 'lucide-react'

type ReportType = 'contributions' | 'loans' | 'profit'

export default function ReportsPage() {
  const { isManager, isOwner } = useAuth()
  const [reportType, setReportType] = useState<ReportType>('contributions')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [downloading, setDownloading] = useState(false)

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      let data

      switch (reportType) {
        case 'contributions':
          data = await getContributionReport({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          })
          break
        case 'loans':
          data = await getLoanReport({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          })
          break
        case 'profit':
          data = await getProfitDistributionReport()
          break
      }

      setReportData(data)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!reportData) return

    try {
      setDownloading(true)
      downloadReportAsCSV(reportData)
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setDownloading(false)
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
              <p className="text-red-700 mt-2">Only managers and owners can view reports.</p>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-gray-600 mt-2">Generate and download financial reports</p>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Generate Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Report Type</label>
                  <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contributions">Contributions Report</SelectItem>
                      <SelectItem value="loans">Loan Applications Report</SelectItem>
                      <SelectItem value="profit">Profit Distribution Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                    {loading ? <Loader className="animate-spin mr-2" size={16} /> : <Calendar size={16} className="mr-2" />}
                    Generate
                  </Button>
                </div>
              </div>
            </Card>

            {/* Report Results */}
            {reportData && (
              <Card className="overflow-hidden">
                <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{reportData.title}</h2>
                    <p className="text-sm text-gray-600">
                      Generated: {new Date(reportData.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={handleDownload} disabled={downloading} variant="outline" className="gap-2">
                    {downloading ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
                    Download CSV
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  {reportData.data.length === 0 ? (
                    <div className="text-center p-12 text-gray-600">
                      <p>No data available for the selected criteria</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          {Object.keys(reportData.data[0] || {}).map((key) => (
                            <th key={key} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {reportData.data.slice(0, 50).map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {Object.values(row).map((value: any, colIdx: number) => (
                              <td key={colIdx} className="px-6 py-4 text-gray-900 text-sm">
                                {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {reportData.data.length > 50 && (
                  <div className="p-4 text-center text-gray-600 text-sm bg-gray-50 border-t">
                    Showing 50 of {reportData.data.length} records. Download CSV to see all records.
                  </div>
                )}
              </Card>
            )}

            {!reportData && !loading && (
              <Card className="p-12 text-center text-gray-600">
                <Calendar size={40} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Select report type and click Generate to view data</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
