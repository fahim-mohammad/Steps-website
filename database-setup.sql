-- STEPS Fund Management Platform - Complete Database Schema
-- Run this in Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'manager', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create contributions table (for deposits)
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank')),
  paid_to TEXT,
  months TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  deposit_slip_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'repaid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create transactions table (audit log)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'loan', 'interest', 'fee')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Managers/owners can view all profiles
CREATE POLICY "Managers can view all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'owner')
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 7. Create RLS Policies for contributions table
-- Members can view their own contributions
CREATE POLICY "Members can view own contributions" ON contributions
  FOR SELECT USING (auth.uid() = member_id);

-- Managers/owners can view all contributions
CREATE POLICY "Managers can view all contributions" ON contributions
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'owner')
  );

-- Members can insert their own contributions
CREATE POLICY "Members can insert own contributions" ON contributions
  FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Managers/owners can update contributions
CREATE POLICY "Managers can update contributions" ON contributions
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'owner')
  );

-- 8. Create RLS Policies for loans table
-- Members can view their own loans
CREATE POLICY "Members can view own loans" ON loans
  FOR SELECT USING (auth.uid() = member_id);

-- Managers/owners can view all loans
CREATE POLICY "Managers can view all loans" ON loans
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'owner')
  );

-- Members can insert loan requests
CREATE POLICY "Members can request loans" ON loans
  FOR INSERT WITH CHECK (auth.uid() = member_id);

-- 9. Create RLS Policies for transactions table
-- Members can view their own transactions
CREATE POLICY "Members can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = member_id);

-- Managers/owners can view all transactions
CREATE POLICY "Managers can view all transactions" ON transactions
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'owner')
  );

-- Managers/owners can insert transactions
CREATE POLICY "Managers can insert transactions" ON transactions
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'owner')
  );

-- 10. Create indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_contributions_member_id ON contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 11. Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done! Your database is ready.
