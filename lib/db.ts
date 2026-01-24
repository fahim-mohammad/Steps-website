import { supabase } from './supabase'
import { Member, Contribution, Loan, LoanPayment, Transaction, Report } from './types'

// ===== MEMBERS =====

export const createMember = async (memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('members')
    .insert([memberData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getMember = async (id: string) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const getMemberByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export const getAllMembers = async () => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'active')
    .eq('approval_status', 'approved')
    .order('join_date', { ascending: false })

  if (error) throw error
  return data
}

export const updateMember = async (id: string, updates: Partial<Member>) => {
  const { data, error } = await supabase
    .from('members')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ===== CONTRIBUTIONS =====

export const createContribution = async (contributionData: Omit<Contribution, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('contributions')
    .insert([contributionData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getContributions = async (memberId: string) => {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('member_id', memberId)
    .order('contribution_date', { ascending: false })

  if (error) throw error
  return data
}

export const getTotalContributions = async (memberId: string) => {
  const { data, error } = await supabase
    .from('contributions')
    .select('amount')
    .eq('member_id', memberId)
    .eq('status', 'completed')

  if (error) throw error
  return data.reduce((sum, c) => sum + c.amount, 0)
}

// ===== LOANS =====

export const createLoan = async (loanData: Omit<Loan, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('loans')
    .insert([loanData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getLoan = async (id: string) => {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const getLoans = async (memberId: string) => {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getAllLoans = async (status?: string) => {
  let query = supabase.from('loans').select('*')
  if (status) query = query.eq('status', status)
  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const updateLoan = async (id: string, updates: Partial<Loan>) => {
  const { data, error } = await supabase
    .from('loans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const approveLoan = async (loanId: string, adminId: string) => {
  const approvedDate = new Date().toISOString().split('T')[0]
  return updateLoan(loanId, {
    status: 'approved',
    approved_by: adminId,
    approved_date: approvedDate,
  } as Partial<Loan>)
}

export const disburseLoan = async (loanId: string) => {
  const disbursementDate = new Date().toISOString().split('T')[0]
  const loan = await getLoan(loanId)
  const maturityDate = new Date()
  maturityDate.setMonth(maturityDate.getMonth() + loan.loan_term_months)
  
  return updateLoan(loanId, {
    status: 'disbursed',
    disbursement_date: disbursementDate,
    maturity_date: maturityDate.toISOString().split('T')[0],
  } as Partial<Loan>)
}

// ===== LOAN PAYMENTS =====

export const createLoanPayment = async (paymentData: Omit<LoanPayment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('loan_payments')
    .insert([paymentData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getLoanPayments = async (loanId: string) => {
  const { data, error } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data
}

// ===== TRANSACTIONS =====

export const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTransactions = async (memberId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ===== REPORTS =====

export const createReport = async (reportData: Omit<Report, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('reports')
    .insert([reportData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getReports = async (limit = 10) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
