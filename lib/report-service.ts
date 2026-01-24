// lib/report-service.ts
// Generate reports for financial data (PDF/Excel export)

import { supabase } from '@/lib/supabase';

export interface ReportData {
  title: string;
  generatedAt: string;
  generatedBy: string;
  data: any[];
}

/**
 * Get contribution report data
 */
export async function getContributionReport(filters?: {
  startDate?: string;
  endDate?: string;
  memberId?: string;
  status?: 'pending' | 'approved' | 'rejected';
}) {
  try {
    let query = supabase
      .from('contributions')
      .select(`
        id,
        member_id,
        amount,
        status,
        created_at,
        updated_at,
        profiles (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.memberId) {
      query = query.eq('member_id', filters.memberId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      title: 'Contribution Report',
      generatedAt: new Date().toISOString(),
      data: data || [],
    };
  } catch (error) {
    console.error('Error generating contribution report:', error);
    throw error;
  }
}

/**
 * Get loan applications report
 */
export async function getLoanReport(filters?: {
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
}) {
  try {
    let query = supabase
      .from('loan_applications')
      .select(`
        id,
        applicant_id,
        amount_requested,
        amount_approved,
        status,
        created_at,
        updated_at,
        approved_at,
        disbursed_at,
        repaid_at,
        profiles (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      title: 'Loan Applications Report',
      generatedAt: new Date().toISOString(),
      data: data || [],
    };
  } catch (error) {
    console.error('Error generating loan report:', error);
    throw error;
  }
}

/**
 * Get profit distribution report
 */
export async function getProfitDistributionReport(filters?: {
  month?: string;
  year?: number;
}) {
  try {
    let query = supabase
      .from('profit_distribution_members')
      .select(`
        id,
        distribution_id,
        member_id,
        member_contribution,
        total_contributions,
        profit_share,
        created_at,
        profit_distributions (
          distribution_month,
          total_profit,
          total_contributions
        ),
        profiles (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.month) {
      query = query.eq('profit_distributions.distribution_month', filters.month);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      title: 'Profit Distribution Report',
      generatedAt: new Date().toISOString(),
      data: data || [],
    };
  } catch (error) {
    console.error('Error generating profit distribution report:', error);
    throw error;
  }
}

/**
 * Get member statement (all transactions)
 */
export async function getMemberStatement(memberId: string) {
  try {
    const [contributions, loans, profits] = await Promise.all([
      supabase
        .from('contributions')
        .select('*')
        .eq('member_id', memberId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
      supabase
        .from('loan_applications')
        .select('*')
        .eq('applicant_id', memberId)
        .order('created_at', { ascending: false }),
      supabase
        .from('profit_distribution_members')
        .select(`
          *,
          profit_distributions (
            distribution_month,
            total_profit
          )
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false }),
    ]);

    if (contributions.error) throw contributions.error;
    if (loans.error) throw loans.error;
    if (profits.error) throw profits.error;

    const totalContributions = (contributions.data || []).reduce((sum: number, c: any) => sum + c.amount, 0);
    const totalProfitEarned = (profits.data || []).reduce((sum: number, p: any) => sum + p.profit_share, 0);
    const activeLoanRequests = (loans.data || []).filter((l: any) => ['pending', 'approved', 'disbursed'].includes(l.status));

    return {
      title: 'Member Statement',
      generatedAt: new Date().toISOString(),
      summary: {
        totalContributions,
        totalProfitEarned,
        activeLoanCount: activeLoanRequests.length,
        totalLoanRequested: activeLoanRequests.reduce((sum: number, l: any) => sum + l.amount_requested, 0),
      },
      data: {
        contributions: contributions.data || [],
        loans: loans.data || [],
        profitHistory: profits.data || [],
      },
    };
  } catch (error) {
    console.error('Error generating member statement:', error);
    throw error;
  }
}

/**
 * Convert report to CSV format
 */
export function reportToCSV(report: ReportData): string {
  if (!report.data || report.data.length === 0) {
    return 'No data available';
  }

  const headers = Object.keys(report.data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = report.data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download report as CSV
 */
export function downloadReportAsCSV(report: ReportData, filename?: string) {
  const csv = reportToCSV(report);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || `${report.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format report data for display
 */
export function formatReportData(data: any[], format: 'table' | 'summary' = 'table') {
  if (format === 'summary') {
    // Calculate summary statistics
    const numericFields = Object.keys(data[0] || {}).filter(key => typeof data[0]?.[key] === 'number');

    return numericFields.reduce((acc, field) => {
      const sum = data.reduce((s, row) => s + (row[field] || 0), 0);
      const avg = sum / data.length;
      const max = Math.max(...data.map(row => row[field] || 0));

      acc[field] = { sum, avg, max };
      return acc;
    }, {} as Record<string, { sum: number; avg: number; max: number }>);
  }

  return data;
}
