// lib/loan-service.ts
// Loan application and management logic
// Data ONLY visible to applicant and owner/manager

import { supabase } from './supabase';

export interface LoanApplication {
  id: string;
  member_id: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  requested_at: string;
  approved_by?: string;
  approved_at?: string;
}

/**
 * Member applies for a loan
 */
export async function applyForLoan(memberId: string, amount: number, purpose: string): Promise<{ success: boolean; loanId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .insert({
        member_id: memberId,
        amount,
        purpose,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    console.log(`✅ Loan application submitted: ৳${amount} by member ${memberId}`);
    return { success: true, loanId: data.id };
  } catch (error) {
    console.error('Loan application error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get member's own loan applications
 * Members can only see their own loans
 */
export async function getMemberLoans(memberId: string): Promise<LoanApplication[]> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('member_id', memberId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching member loans:', error);
    return [];
  }
}

/**
 * Get all loan applications
 * ONLY owner/manager can access
 */
export async function getAllLoanApplications(managerRole: 'owner' | 'manager'): Promise<LoanApplication[]> {
  try {
    if (managerRole !== 'owner' && managerRole !== 'manager') {
      console.warn('Unauthorized access to loan applications');
      return [];
    }

    const { data, error } = await supabase
      .from('loan_applications')
      .select(`
        *,
        member:profiles!member_id(full_name, email)
      `)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all loans:', error);
    return [];
  }
}

/**
 * Approve or reject loan application
 * ONLY owner/manager can do this
 */
export async function updateLoanStatus(
  loanId: string,
  status: 'approved' | 'rejected' | 'disbursed' | 'repaid',
  managerId: string,
  managerRole: 'owner' | 'manager'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (managerRole !== 'owner' && managerRole !== 'manager') {
      return { success: false, error: 'Unauthorized' };
    }

    const updateData: any = {
      status,
    };

    if (status === 'approved') {
      updateData.approved_by = managerId;
      updateData.approved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('loan_applications')
      .update(updateData)
      .eq('id', loanId);

    if (error) throw error;

    console.log(`✅ Loan ${status}: ${loanId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating loan:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get loan statistics
 * ONLY owner/manager can access
 */
export async function getLoanStatistics(managerRole: 'owner' | 'manager') {
  try {
    if (managerRole !== 'owner' && managerRole !== 'manager') {
      return null;
    }

    const { data, error } = await supabase
      .from('loan_applications')
      .select('status, amount');

    if (error) throw error;

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      disbursed: 0,
      repaid: 0,
      totalPending: 0,
      totalApproved: 0,
    };

    data?.forEach((loan: any) => {
      stats[loan.status as keyof typeof stats]++;
      if (loan.status === 'pending') stats.totalPending += loan.amount;
      if (loan.status === 'approved') stats.totalApproved += loan.amount;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating loan stats:', error);
    return null;
  }
}

/**
 * Check if member can apply for loan
 * (Has sufficient contribution history, no pending loans, etc.)
 */
export async function canMemberApplyForLoan(memberId: string): Promise<{ canApply: boolean; reason?: string }> {
  try {
    // Check if member has any pending loans
    const { data: pendingLoans } = await supabase
      .from('loan_applications')
      .select('id')
      .eq('member_id', memberId)
      .eq('status', 'pending');

    if (pendingLoans && pendingLoans.length > 0) {
      return { canApply: false, reason: 'You have a pending loan application' };
    }

    // Check minimum contribution
    const { data: contributions } = await supabase
      .from('contributions')
      .select('amount')
      .eq('member_id', memberId)
      .eq('status', 'approved');

    const totalContribution = (contributions || []).reduce((sum, c: any) => sum + c.amount, 0);

    if (totalContribution === 0) {
      return { canApply: false, reason: 'You need at least one approved contribution' };
    }

    return { canApply: true };
  } catch (error) {
    console.error('Error checking loan eligibility:', error);
    return { canApply: false, reason: 'Error checking eligibility' };
  }
}

/**
 * Get maximum loan amount a member can apply for
 * (Based on contribution history)
 */
export async function getMaxLoanAmount(memberId: string): Promise<number> {
  try {
    const { data: contributions } = await supabase
      .from('contributions')
      .select('amount')
      .eq('member_id', memberId)
      .eq('status', 'approved');

    const totalContribution = (contributions || []).reduce((sum, c: any) => sum + c.amount, 0);

    // Max loan = 3x total contributions (customize as needed)
    return Math.round(totalContribution * 3 * 100) / 100;
  } catch (error) {
    console.error('Error calculating max loan:', error);
    return 0;
  }
}
