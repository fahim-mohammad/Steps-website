-- Add profit distribution and accountant columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_accountant BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_profit_earned DECIMAL(10, 2) DEFAULT 0;

-- Create profit distribution table
CREATE TABLE IF NOT EXISTS profit_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL, -- Format: "2024-01"
  total_profit DECIMAL(10, 2) NOT NULL,
  distribution_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profit distribution members table (tracks individual distributions)
CREATE TABLE IF NOT EXISTS profit_distribution_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID NOT NULL REFERENCES profit_distributions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_contribution DECIMAL(10, 2) NOT NULL,
  profit_share DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loan applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'repaid')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('signup', 'deposit', 'loan', 'profit', 'reminder', 'system')),
  method TEXT NOT NULL CHECK (method IN ('email', 'sms', 'whatsapp')),
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create theme preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'bn')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profit_distributions_month_year ON profit_distributions(month_year);
CREATE INDEX IF NOT EXISTS idx_profit_distribution_members_member_id ON profit_distribution_members(member_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_member_id ON loan_applications(member_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_user_preferences_language ON user_preferences(language);

-- Add RLS Policies for new tables

-- Profit distributions - visible to owner/manager/accountant
DROP POLICY IF EXISTS "profit_distributions_access" ON profit_distributions;
CREATE POLICY "profit_distributions_access" ON profit_distributions
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'manager', 'accountant')
  );

-- Profit distribution members - visible to owner/manager/accountant and member's own distribution
DROP POLICY IF EXISTS "profit_distribution_members_access" ON profit_distribution_members;
CREATE POLICY "profit_distribution_members_access" ON profit_distribution_members
  FOR SELECT USING (
    auth.uid() = member_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'manager', 'accountant')
  );

-- Loan applications - visible only to applicant and owner/manager
DROP POLICY IF EXISTS "loan_applications_select" ON loan_applications;
CREATE POLICY "loan_applications_select" ON loan_applications
  FOR SELECT USING (
    auth.uid() = member_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'manager')
  );

DROP POLICY IF EXISTS "loan_applications_insert" ON loan_applications;
CREATE POLICY "loan_applications_insert" ON loan_applications
  FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "loan_applications_update" ON loan_applications;
CREATE POLICY "loan_applications_update" ON loan_applications
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'manager')
  );

-- Notifications - visible to recipient and owner/manager
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (
    auth.uid() = recipient_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'manager')
  );

-- User preferences - users can update their own
DROP POLICY IF EXISTS "user_preferences_select" ON user_preferences;
CREATE POLICY "user_preferences_select" ON user_preferences
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_preferences_insert" ON user_preferences;
CREATE POLICY "user_preferences_insert" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_preferences_update" ON user_preferences;
CREATE POLICY "user_preferences_update" ON user_preferences
  FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on new tables
ALTER TABLE profit_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_distribution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done! Extended schema ready.
