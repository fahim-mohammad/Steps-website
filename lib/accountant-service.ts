// lib/accountant-service.ts
// Accountant role assignment (Owner only)

import { supabase } from './supabase';

export interface AccountantProfile {
  id: string;
  full_name: string;
  email: string;
  assigned_at: string;
}

/**
 * Assign accountant role to a member
 * ONLY owner can do this
 */
export async function assignAccountant(memberId: string, ownerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the caller is owner
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', ownerId)
      .single();

    if (ownerProfile?.role !== 'owner') {
      return { success: false, error: 'Only owner can assign accountant' };
    }

    // Assign accountant role
    const { error } = await supabase
      .from('profiles')
      .update({
        is_accountant: true,
        assigned_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (error) throw error;

    console.log(`✅ Accountant assigned: ${memberId}`);
    return { success: true };
  } catch (error) {
    console.error('Error assigning accountant:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Remove accountant role
 * ONLY owner can do this
 */
export async function removeAccountant(memberId: string, ownerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the caller is owner
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', ownerId)
      .single();

    if (ownerProfile?.role !== 'owner') {
      return { success: false, error: 'Only owner can remove accountant' };
    }

    // Remove accountant role
    const { error } = await supabase
      .from('profiles')
      .update({
        is_accountant: false,
        assigned_at: null,
      })
      .eq('id', memberId);

    if (error) throw error;

    console.log(`✅ Accountant removed: ${memberId}`);
    return { success: true };
  } catch (error) {
    console.error('Error removing accountant:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get current accountant
 */
export async function getCurrentAccountant(): Promise<AccountantProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, assigned_at')
      .eq('is_accountant', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No accountant assigned
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching accountant:', error);
    return null;
  }
}

/**
 * Check if user is accountant
 */
export async function isAccountant(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_accountant')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.is_accountant || false;
  } catch (error) {
    console.error('Error checking accountant status:', error);
    return false;
  }
}

/**
 * Get list of member candidates for accountant role
 * (All members except current accountant)
 */
export async function getAccountantCandidates(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, is_accountant')
      .eq('role', 'member')
      .order('full_name');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}

/**
 * Create contract/document for accountant assignment
 * Shows on accountant's profile
 */
export function generateAccountantContract(accountantName: string, assignedDate: string): string {
  const date = new Date(assignedDate).toLocaleDateString();
  return `
STEPS FUND ACCOUNTANT ASSIGNMENT CONTRACT

Name: ${accountantName}
Assigned Date: ${date}

Responsibilities:
- Maintain financial records
- Process deposits and withdrawals
- Prepare monthly reports
- Ensure fund compliance
- Handle notification distributions

This assignment can be revoked by the fund owner at any time.

Accountants are granted special access to:
✓ All financial records
✓ Profit distribution reports
✓ Transaction history
✓ Member contribution data

Accountants CANNOT:
✗ Approve/reject deposits
✗ Approve/reject loans
✗ View member loan applications
✗ Assign other accountants
`;
}
