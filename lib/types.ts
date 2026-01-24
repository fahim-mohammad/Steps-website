// User and Authentication types
export type UserRole = 'admin' | 'member'

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Member types
export interface Member {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  national_id?: string
  address?: string
  occupation?: string
  emergency_contact?: string
  emergency_phone?: string
  total_contributed: number
  total_borrowed: number
  status: 'active' | 'inactive' | 'suspended'
  join_date: string
  created_at: string
  updated_at: string
}

// Contribution types
export type ContributionPeriod = 'weekly' | 'monthly' | 'quarterly'

export interface Contribution {
  id: string
  member_id: string
  amount: number
  contribution_date: string
  period: ContributionPeriod
  status: 'pending' | 'completed' | 'reversed'
  payment_method?: 'cash' | 'bank' | 'mobile_money'
  notes?: string
  created_at: string
  updated_at: string
}

// Loan types
export type LoanStatus = 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted'

export interface Loan {
  id: string
  member_id: string
  principal_amount: number
  interest_rate: number
  loan_term_months: number
  approved_date?: string
  disbursement_date?: string
  maturity_date?: string
  status: LoanStatus
  monthly_payment?: number
  total_paid: number
  remaining_balance: number
  purpose?: string
  approved_by?: string
  created_at: string
  updated_at: string
}

// Loan Payment types
export interface LoanPayment {
  id: string
  loan_id: string
  payment_amount: number
  payment_date: string
  payment_method?: 'cash' | 'bank' | 'mobile_money'
  status: 'pending' | 'completed' | 'reversed'
  notes?: string
  created_at: string
  updated_at: string
}

// Transaction types
export type TransactionType = 'contribution' | 'loan_disbursement' | 'loan_payment' | 'withdrawal' | 'penalty' | 'bonus'

export interface Transaction {
  id: string
  member_id: string
  transaction_type: TransactionType
  amount: number
  description?: string
  reference_id?: string
  balance_after: number
  created_at: string
}

// Report types
export type ReportType = 'summary' | 'member_details' | 'loan_status' | 'contribution_history'

export interface Report {
  id: string
  report_type: ReportType
  title: string
  generated_by: string
  period_start: string
  period_end: string
  total_contributions: number
  total_loans: number
  total_members: number
  data?: Record<string, any>
  created_at: string
}
}

// Contribution record
export interface Contribution {
  id: string;
  userId: string;
  fundId: string;
  amount: number;
  date: string;
  month: string; // YYYY-MM
  verified: boolean;
  verifiedBy?: string;
  createdAt: string;
}

// Loan request (hidden from regular members)
export interface Loan {
  id: string;
  userId: string;
  fundId: string;
  amount: number;
  purpose?: string;
  requestDate: string;
  status: LoanStatus;
  approvedAmount?: number;
  approvedBy?: string;
  approvalDate?: string;
  dueDate?: string;
  repaymentSchedule?: RepaymentSchedule[];
  createdAt: string;
}

// Repayment schedule for loans
export interface RepaymentSchedule {
  id: string;
  loanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
}

// Dashboard statistics
export interface DashboardStats {
  totalBalance: number;
  totalContributed: number;
  pendingContributions: number;
  loansCount: number;
  activeLoans: number;
  dividendEarned?: number;
}

// Admin dashboard stats
export interface AdminStats {
  totalMembers: number;
  totalBalance: number;
  totalContributed: number;
  pendingLoans: number;
  approvedLoans: number;
  totalLoansAmount: number;
}
