-- ============================================
-- STEPS Database - PART 1: DROP & CREATE TABLES
-- ============================================
-- This drops all existing tables and recreates them fresh
-- Run this FIRST to create all tables
-- Then run PART 2 for RLS policies
-- ============================================

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS loan_payments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  national_id VARCHAR(50),
  address VARCHAR(500),
  occupation VARCHAR(255),
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  total_contributed DECIMAL(10, 2) DEFAULT 0,
  total_borrowed DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  approval_status VARCHAR(50) DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contributions table
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Loans table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  principal_amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  loan_term_months INTEGER NOT NULL,
  approved_date DATE,
  disbursement_date DATE,
  maturity_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  monthly_payment DECIMAL(10, 2),
  total_paid DECIMAL(10, 2) DEFAULT 0,
  remaining_balance DECIMAL(10, 2),
  purpose TEXT,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Loan Payments table
CREATE TABLE loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  reference_id UUID,
  balance_after DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  generated_by UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_contributions DECIMAL(10, 2),
  total_loans DECIMAL(10, 2),
  total_members INTEGER,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_contributions_member_id ON contributions(member_id);
CREATE INDEX idx_contributions_date ON contributions(contribution_date);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- ============================================
-- PART 1 COMPLETE
-- ============================================
-- All tables and indexes created successfully!
-- 
-- NEXT STEP: After verifying tables exist in Table Editor,
-- scroll down and run PART 2 for RLS security policies
-- ============================================

-- ============================================
-- STEPS Database - PART 2: ROW LEVEL SECURITY
-- ============================================
-- Run this AFTER tables are created
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can see their own profile" ON users;
DROP POLICY IF EXISTS "Admins can see all users" ON users;
DROP POLICY IF EXISTS "Members can see their own member profile" ON members;
DROP POLICY IF EXISTS "Admins can see all members" ON members;
DROP POLICY IF EXISTS "Members can see their own contributions" ON contributions;
DROP POLICY IF EXISTS "Members can see their own loans" ON loans;
DROP POLICY IF EXISTS "Members can see their own loan payments" ON loan_payments;
DROP POLICY IF EXISTS "Members can see their own transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can see reports" ON reports;

-- Users table policies
CREATE POLICY "Users can see their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can see all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Members table policies
CREATE POLICY "Members can see their own member profile" ON members
  FOR SELECT USING (
    (user_id = auth.uid() AND approval_status = 'approved') OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can see all members" ON members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Contributions policies
CREATE POLICY "Members can see their own contributions" ON contributions
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members 
      WHERE user_id = auth.uid() AND approval_status = 'approved'
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Loans policies
CREATE POLICY "Members can see their own loans" ON loans
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members 
      WHERE user_id = auth.uid() AND approval_status = 'approved'
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Loan payments policies
CREATE POLICY "Members can see their own loan payments" ON loan_payments
  FOR SELECT USING (
    loan_id IN (
      SELECT id FROM loans 
      WHERE member_id IN (
        SELECT id FROM members 
        WHERE user_id = auth.uid() AND approval_status = 'approved'
      )
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Transactions policies
CREATE POLICY "Members can see their own transactions" ON transactions
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members 
      WHERE user_id = auth.uid() AND approval_status = 'approved'
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Reports policies
CREATE POLICY "Authenticated users can see reports" ON reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- PART 2 COMPLETE
-- ============================================
-- Row Level Security policies configured!
-- Database is now fully secured and ready to use
