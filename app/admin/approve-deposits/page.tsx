'use client';

import { useState, useEffect } from 'react';
import { useRouteGuard } from '@/lib/use-route-guard';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Deposit {
  id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  amount: number;
  payment_method: 'cash' | 'bank';
  paid_to?: string;
  months: string[];
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  deposit_slip_url?: string;
}

export default function ApproveDepositsPage() {
  const { canAccess, isLoading } = useRouteGuard();
  const { toast } = useToast();
  const language = 'en'; // Default to English
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [approving, setApproving] = useState<string | null>(null);

  // Translations
  const translations = {
    en: {
      title: 'Approve Deposits',
      description: 'Review and approve member deposit submissions',
      pending: 'Pending Approvals',
      approved: 'Approved',
      rejected: 'Rejected',
      allDeposits: 'All Deposits',
      memberName: 'Member Name',
      email: 'Email',
      amount: 'Amount',
      months: 'Months',
      method: 'Payment Method',
      paidTo: 'Paid To',
      status: 'Status',
      date: 'Submitted',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      approving: 'Approving...',
      rejecting: 'Rejecting...',
      slip: 'View Slip',
      notes: 'Notes',
      totalMonth: 'months',
      cash: 'Cash',
      bank: 'Bank',
      noPending: 'No pending deposits',
      noDeposits: 'No deposits found',
      success: 'Deposit approved successfully',
      rejectionMessage: 'Deposit rejected',
      error: 'Error processing deposit',
      emailSent: 'Email notification sent to member',
      whatsappSent: 'WhatsApp notification sent to member',
      contributionUpdated: 'Member contribution updated',
      viewSlip: 'View Receipt',
      approvalReason: 'Reason (Optional)',
      confirmApprove: 'Are you sure you want to approve this deposit?',
      confirmReject: 'Are you sure you want to reject this deposit?',
    },
    bn: {
      title: 'জমা অনুমোদন করুন',
      description: 'সদস্য জমা জমা দেওয়ার অনুমোদন পর্যালোচনা করুন এবং করুন',
      pending: 'অপেক্ষারত অনুমোদন',
      approved: 'অনুমোদিত',
      rejected: 'প্রত্যাখ্যাত',
      allDeposits: 'সমস্ত জমা',
      memberName: 'সদস্যের নাম',
      email: 'ইমেইল',
      amount: 'পরিমাণ',
      months: 'মাস',
      method: 'পেমেন্ট পদ্ধতি',
      paidTo: 'কাকে দেওয়া হয়েছে',
      status: 'অবস্থা',
      date: 'জমা দেওয়া',
      actions: 'ক্রিয়া',
      approve: 'অনুমোদন করুন',
      reject: 'প্রত্যাখ্যান করুন',
      approving: 'অনুমোদন করা হচ্ছে...',
      rejecting: 'প্রত্যাখ্যান করা হচ্ছে...',
      slip: 'স্লিপ দেখুন',
      notes: 'মন্তব্য',
      totalMonth: 'মাস',
      cash: 'নগদ',
      bank: 'ব্যাংক',
      noPending: 'কোনো অপেক্ষারত জমা নেই',
      noDeposits: 'কোনো জমা খুঁজে পাওয়া যায়নি',
      success: 'জমা সফলভাবে অনুমোদিত হয়েছে',
      rejectionMessage: 'জমা প্রত্যাখ্যান করা হয়েছে',
      error: 'জমা প্রক্রিয়া করতে ত্রুটি হয়েছে',
      emailSent: 'সদস্যকে ইমেইল বিজ্ঞপ্তি পাঠানো হয়েছে',
      whatsappSent: 'সদস্যকে হোয়াটসঅ্যাপ বিজ্ঞপ্তি পাঠানো হয়েছে',
      contributionUpdated: 'সদস্যের অবদান আপডেট করা হয়েছে',
      viewSlip: 'রসিদ দেখুন',
      approvalReason: 'কারণ (ঐচ্ছিক)',
      confirmApprove: 'আপনি কি এই জমা অনুমোদন করতে নিশ্চিত?',
      confirmReject: 'আপনি কি এই জমা প্রত্যাখ্যান করতে নিশ্চিত?',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (canAccess) {
      fetchDeposits();
    }
  }, [canAccess, filter]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);

      // Fetch deposits from contributions table
      let query = supabase.from('contributions').select(`
        id,
        amount,
        payment_method,
        paid_to,
        months,
        status,
        notes,
        created_at,
        deposit_slip_url,
        member_id,
        member:profiles!member_id(full_name, email)
      `);

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedDeposits = (data || []).map((d: any) => ({
        id: d.id,
        member_id: d.member_id,
        member_name: d.member?.full_name || 'Unknown',
        member_email: d.member?.email || '',
        amount: d.amount,
        payment_method: d.payment_method,
        paid_to: d.paid_to,
        months: d.months || [],
        status: d.status,
        notes: d.notes,
        created_at: d.created_at,
        deposit_slip_url: d.deposit_slip_url,
      }));

      setDeposits(formattedDeposits);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.error,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (deposit: Deposit) => {
    if (!confirm(t.confirmApprove)) return;

    try {
      setApproving(deposit.id);

      // Update deposit status
      const { error: updateError } = await supabase
        .from('contributions')
        .update({ status: 'approved' })
        .eq('id', deposit.id);

      if (updateError) throw updateError;

      // Trigger email notification
      await sendEmailNotification(deposit.member_email, deposit.member_name, 'approved', deposit.amount);

      // Trigger WhatsApp notification
      await sendWhatsAppNotification(deposit.member_id, deposit.member_name, 'approved', deposit.amount);

      toast({
        title: 'Success',
        description: `${t.success}. ${t.emailSent}. ${t.whatsappSent}.`,
      });

      // Refresh list
      fetchDeposits();
    } catch (error) {
      console.error('Error approving deposit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.error,
      });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (deposit: Deposit) => {
    if (!confirm(t.confirmReject)) return;

    try {
      setApproving(deposit.id);

      // Update deposit status
      const { error: updateError } = await supabase
        .from('contributions')
        .update({ status: 'rejected' })
        .eq('id', deposit.id);

      if (updateError) throw updateError;

      // Trigger email notification
      await sendEmailNotification(deposit.member_email, deposit.member_name, 'rejected', deposit.amount);

      // Trigger WhatsApp notification
      await sendWhatsAppNotification(deposit.member_id, deposit.member_name, 'rejected', deposit.amount);

      toast({
        title: 'Success',
        description: t.rejected,
      });

      // Refresh list
      fetchDeposits();
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.error,
      });
    } finally {
      setApproving(null);
    }
  };

  // Email notification via Brevo API
  const sendEmailNotification = async (
    email: string,
    name: string,
    action: 'approved' | 'rejected',
    amount: number
  ) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, name, amount, status: action }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      console.log('✉️ Email sent successfully:', result);
    } catch (error) {
      console.error('Email notification error:', error);
      toast({
        title: 'Warning',
        description: 'Email notification may not have been sent',
        variant: 'destructive',
      });
    }
  };

  // WhatsApp notification via Meta WhatsApp Business API
  const sendWhatsAppNotification = async (
    memberId: string,
    name: string,
    action: 'approved' | 'rejected',
    amount: number
  ) => {
    try {
      // First, fetch the member's phone number from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', memberId)
        .single();

      if (profileError || !profile?.phone) {
        console.warn('Phone number not found for member:', memberId);
        toast({
          title: 'Warning',
          description: 'Member phone number not found. WhatsApp not sent.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: profile.phone,
          name,
          amount,
          status: action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      const result = await response.json();
      console.log('💬 WhatsApp sent successfully:', result);
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      toast({
        title: 'Warning',
        description: 'WhatsApp notification may not have been sent',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only managers and owners can approve deposits</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t.description}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['pending', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300'
            }`}
          >
            {f === 'pending' ? `${t.pending} (${deposits.filter(d => d.status === 'pending').length})` : t.allDeposits}
          </button>
        ))}
      </div>

      {/* Deposits List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : deposits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-600 dark:text-slate-400">
            {filter === 'pending' ? t.noPending : t.noDeposits}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <Card key={deposit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
                  {/* Member Info */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      {t.memberName}
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {deposit.member_name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {deposit.member_email}
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      {t.amount}
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ৳{deposit.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {deposit.months.length} {t.totalMonth}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      {t.method}
                    </p>
                    <Badge className="mt-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-0">
                      {deposit.payment_method === 'cash' ? t.cash : t.bank}
                    </Badge>
                    {deposit.paid_to && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {t.paidTo}: {deposit.paid_to}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      {t.status}
                    </p>
                    <Badge
                      className={`mt-1 border-0 ${
                        deposit.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                          : deposit.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}
                    >
                      {deposit.status === 'pending'
                        ? t.pending
                        : deposit.status === 'approved'
                        ? t.approved
                        : t.rejected}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                      {t.date}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Months */}
                    <div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                        {t.months}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {deposit.months.map((month) => (
                          <Badge key={month} variant="outline" className="text-xs">
                            {new Date(month + '-01').toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                              month: 'short',
                              year: '2-digit',
                            })}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {deposit.notes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                          {t.notes}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{deposit.notes}</p>
                      </div>
                    )}

                    {/* Receipt Link */}
                    {deposit.deposit_slip_url && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                          {t.slip}
                        </p>
                        <Link
                          href={`/deposits/${deposit.deposit_slip_url}`}
                          target="_blank"
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          {t.viewSlip} →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {deposit.status === 'pending' && (
                  <div className="flex gap-2 mt-4 flex-col sm:flex-row">
                    <button
                      onClick={() => handleReject(deposit)}
                      disabled={approving === deposit.id}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-all disabled:opacity-50"
                    >
                      {approving === deposit.id ? t.rejecting : t.reject}
                    </button>
                    <button
                      onClick={() => handleApprove(deposit)}
                      disabled={approving === deposit.id}
                      className="flex-1 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 font-medium transition-all disabled:opacity-50"
                    >
                      {approving === deposit.id ? t.approving : t.approve}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Box */}
      <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-400 text-sm">
            ℹ️ {language === 'en' ? 'About Approvals' : 'অনুমোদন সম্পর্কে'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 dark:text-blue-400 space-y-2 text-sm">
          <p>
            {language === 'en'
              ? '• Review all pending deposits from members'
              : '• সদস্যদের কাছ থেকে সমস্ত অপেক্ষারত জমা পর্যালোচনা করুন'}
          </p>
          <p>
            {language === 'en'
              ? '• Approve to update member contribution totals'
              : '• সদস্য অবদান মোট আপডেট করতে অনুমোদন করুন'}
          </p>
          <p>
            {language === 'en'
              ? '• Reject if deposit is invalid or incomplete'
              : '• জমা অবৈধ বা অসম্পূর্ণ হলে প্রত্যাখ্যান করুন'}
          </p>
          <p>
            {language === 'en'
              ? '• Automatic notifications sent to member on approval/rejection'
              : '• অনুমোদন/প্রত্যাখ্যানের সময় সদস্যকে স্বয়ংক্রিয় বিজ্ঞপ্তি পাঠানো হয়'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
