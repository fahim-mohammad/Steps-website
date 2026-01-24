// lib/profit-distribution.ts
// Profit calculation and distribution logic

import { supabase } from './supabase';

export interface ProfitDistributionResult {
  success: boolean;
  totalProfit: number;
  membersDistributed: number;
  error?: string;
}

/**
 * Calculate and distribute profit proportionally to all members
 * based on their total contributions
 */
export async function distributeMonthlyProfit(monthYear: string, totalProfit: number, managerId: string): Promise<ProfitDistributionResult> {
  try {
    // 1. Get all members with their contributions
    const { data: members, error: membersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('role', 'member');

    if (membersError || !members) {
      throw new Error('Failed to fetch members');
    }

    if (members.length === 0) {
      return { success: false, totalProfit, membersDistributed: 0, error: 'No members found' };
    }

    // 2. Calculate total contributions for each member
    const { data: contributions, error: contribError } = await supabase
      .from('contributions')
      .select('member_id, amount')
      .eq('status', 'approved');

    if (contribError) {
      throw new Error('Failed to fetch contributions');
    }

    // Group contributions by member
    const memberContributions: Record<string, number> = {};
    let totalContributions = 0;

    contributions?.forEach((c: any) => {
      memberContributions[c.member_id] = (memberContributions[c.member_id] || 0) + c.amount;
      totalContributions += c.amount;
    });

    if (totalContributions === 0) {
      return { success: false, totalProfit, membersDistributed: 0, error: 'No contributions found' };
    }

    // 3. Create profit distribution record
    const { data: distribution, error: distError } = await supabase
      .from('profit_distributions')
      .insert({
        month_year: monthYear,
        total_profit: totalProfit,
        created_by: managerId,
      })
      .select('id')
      .single();

    if (distError || !distribution) {
      throw new Error('Failed to create distribution record');
    }

    // 4. Calculate and insert individual profit shares
    const profitShares: any[] = [];
    let distributedCount = 0;

    for (const member of members) {
      const memberTotal = memberContributions[member.id] || 0;
      if (memberTotal > 0) {
        // Calculate profit share proportionally
        const profitShare = (memberTotal / totalContributions) * totalProfit;

        profitShares.push({
          distribution_id: distribution.id,
          member_id: member.id,
          total_contribution: memberTotal,
          profit_share: Math.round(profitShare * 100) / 100, // Round to 2 decimals
        });

        distributedCount++;
      }
    }

    if (profitShares.length > 0) {
      const { error: insertError } = await supabase
        .from('profit_distribution_members')
        .insert(profitShares);

      if (insertError) {
        throw new Error('Failed to insert profit shares');
      }
    }

    // 5. Update member profiles with new profit earned
    for (const share of profitShares) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_profit_earned')
        .eq('id', share.member_id)
        .single();

      if (profile) {
        const newTotal = (profile.total_profit_earned || 0) + share.profit_share;
        await supabase
          .from('profiles')
          .update({ total_profit_earned: newTotal })
          .eq('id', share.member_id);
      }
    }

    console.log(`✅ Profit distributed: ৳${totalProfit} to ${distributedCount} members`);
    return { success: true, totalProfit, membersDistributed: distributedCount };
  } catch (error) {
    console.error('Profit distribution error:', error);
    return { success: false, totalProfit, membersDistributed: 0, error: String(error) };
  }
}

/**
 * Get profit distribution history for a member
 */
export async function getMemberProfitHistory(memberId: string) {
  try {
    const { data, error } = await supabase
      .from('profit_distribution_members')
      .select(`
        *,
        distribution:profit_distributions(month_year, total_profit, distribution_date)
      `)
      .eq('member_id', memberId)
      .order('distribution(distribution_date)', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profit history:', error);
    return [];
  }
}

/**
 * Get total profit earned by a member
 */
export async function getMemberTotalProfit(memberId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profit_distribution_members')
      .select('profit_share')
      .eq('member_id', memberId);

    if (error) throw error;

    return (data || []).reduce((total, item) => total + (item.profit_share || 0), 0);
  } catch (error) {
    console.error('Error calculating total profit:', error);
    return 0;
  }
}

/**
 * Get profit distribution summary for dashboard
 */
export async function getProfitDistributionSummary() {
  try {
    const { data, error } = await supabase
      .from('profit_distributions')
      .select(`
        *,
        members:profit_distribution_members(count)
      `)
      .order('distribution_date', { ascending: false })
      .limit(12);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profit summary:', error);
    return [];
  }
}
