'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const MONTHLY_CONTRIBUTION = 1000; // Default monthly contribution amount in BDT

export default function DepositSubmissionPage() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [paidTo, setPaidTo] = useState('');
  const [depositSlip, setDepositSlip] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Translations
  const translations = {
    en: {
      title: 'Submit Deposit',
      description: 'Submit your monthly contribution payment',
      selectMonths: 'Select Months',
      selectMonthsDesc: 'Choose one or more months for this deposit',
      amount: 'Amount',
      totalAmount: 'Total Amount',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      bank: 'Bank Transfer',
      paidTo: 'Paid To (Name)',
      paidToDesc: 'Name of person receiving cash',
      depositSlip: 'Upload Deposit Slip/Receipt',
      depositSlipDesc: 'Upload photo or document of payment receipt',
      notes: 'Additional Notes (Optional)',
      notesDesc: 'Any additional information about this payment',
      submit: 'Submit Deposit',
      cancel: 'Cancel',
      status: 'Status',
      pending: 'Pending Confirmation',
      selectAtLeastOne: 'Please select at least one month',
      selectPaymentMethod: 'Please select a payment method',
      enterPaidTo: 'Please enter the name of who received the cash',
      uploadSlip: 'Please upload a deposit slip',
      submitting: 'Submitting...',
      success: 'Deposit submitted successfully!',
      error: 'Error submitting deposit. Please try again.',
      month: 'Month',
      submitted: 'Your deposit has been submitted!',
      submittedDesc: 'Status: Pending manager confirmation',
      viewDeposits: 'View Deposits',
      loading: 'Loading...',
      errorLoading: 'Error loading page',
      pleaseLogin: 'Please log in to submit deposits',
    },
    bn: {
      title: 'জমা জমা দিন',
      description: 'আপনার মাসিক অবদানের পেমেন্ট জমা দিন',
      selectMonths: 'মাস নির্বাচন করুন',
      selectMonthsDesc: 'এই জমার জন্য এক বা একাধিক মাস বেছে নিন',
      amount: 'পরিমাণ',
      totalAmount: 'মোট পরিমাণ',
      paymentMethod: 'পেমেন্ট পদ্ধতি',
      cash: 'নগদ',
      bank: 'ব্যাংক ট্রান্সফার',
      paidTo: 'কাকে দেওয়া হয়েছে (নাম)',
      paidToDesc: 'যে ব্যক্তি নগদ অর্থ গ্রহণ করেছেন তার নাম',
      depositSlip: 'ডিপোজিট স্লিপ/রসিদ আপলোড করুন',
      depositSlipDesc: 'পেমেন্ট রসিদের ফটো বা ডকুমেন্ট আপলোড করুন',
      notes: 'অতিরিক্ত মন্তব্য (ঐচ্ছিক)',
      notesDesc: 'এই পেমেন্ট সম্পর্কে যে কোনো অতিরিক্ত তথ্য',
      submit: 'জমা দিন',
      cancel: 'বাতিল করুন',
      status: 'অবস্থা',
      pending: 'ম্যানেজার নিশ্চিতকরণের অপেক্ষায়',
      selectAtLeastOne: 'অনুগ্রহ করে কমপক্ষে একটি মাস নির্বাচন করুন',
      selectPaymentMethod: 'অনুগ্রহ করে একটি পেমেন্ট পদ্ধতি নির্বাচন করুন',
      enterPaidTo: 'অনুগ্রহ করে নগদ অর্থ যিনি গ্রহণ করেছেন তার নাম লিখুন',
      uploadSlip: 'অনুগ্রহ করে একটি জমা স্লিপ আপলোড করুন',
      submitting: 'জমা দেওয়া হচ্ছে...',
      success: 'জমা সফলভাবে জমা দেওয়া হয়েছে!',
      error: 'জমা জমা দিতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      month: 'মাস',
      submitted: 'আপনার জমা জমা দেওয়া হয়েছে!',
      submittedDesc: 'অবস্থা: ম্যানেজারের নিশ্চিতকরণের অপেক্ষায়',
      viewDeposits: 'জমা দেখুন',
      loading: 'লোড হচ্ছে...',
      errorLoading: 'পৃষ্ঠা লোড করতে ত্রুটি হয়েছে',
      pleaseLogin: 'জমা জমা দিতে অনুগ্রহ করে লগইন করুন',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: date.toISOString().slice(0, 7), // YYYY-MM format
      label: date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }).reverse();

  // Calculate total amount
  const totalAmount = selectedMonths.length * MONTHLY_CONTRIBUTION;

  const handleMonthToggle = (month: string) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDepositSlip(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (selectedMonths.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.selectAtLeastOne,
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.selectPaymentMethod,
      });
      return;
    }

    if (paymentMethod === 'cash' && !paidTo.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.enterPaidTo,
      });
      return;
    }

    if (!depositSlip) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.uploadSlip,
      });
      return;
    }

    if (!user || !profile) return;

    try {
      setLoading(true);

      // Upload deposit slip to Supabase storage
      const fileName = `deposits/${user.id}/${Date.now()}-${depositSlip.name}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('deposits')
        .upload(fileName, depositSlip);

      if (uploadError) throw uploadError;

      // Create deposit record
      const { error: dbError } = await supabase.from('contributions').insert([
        {
          member_id: user.id,
          amount: totalAmount,
          payment_method: paymentMethod,
          paid_to: paymentMethod === 'cash' ? paidTo : null,
          deposit_slip_url: uploadData?.path || null,
          notes: notes || null,
          status: 'pending',
          months: selectedMonths,
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: t.success,
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t.error,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.pleaseLogin}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">✓</div>
            <CardTitle className="text-green-900 dark:text-green-400">
              {t.submitted}
            </CardTitle>
            <CardDescription className="text-green-800 dark:text-green-300">
              {t.submittedDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {t.totalAmount}:
                </span>{' '}
                ৳{totalAmount.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {t.status}:
                </span>{' '}
                <Badge className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-0">
                  {t.pending}
                </Badge>
              </p>
            </div>
            <Button
              onClick={() => router.push('/contributions')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {t.viewDeposits}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t.description}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t.selectMonths}</CardTitle>
            <CardDescription>{t.selectMonthsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Month Selection Grid */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900 dark:text-white">
                  {t.selectMonths}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {months.map((month) => (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() => handleMonthToggle(month.value)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        selectedMonths.includes(month.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/50'
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Amount Display */}
              {selectedMonths.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    {selectedMonths.length} {language === 'en' ? 'month(s)' : 'মাস'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                    ৳{totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    @ ৳{MONTHLY_CONTRIBUTION.toLocaleString()}/month
                  </p>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900 dark:text-white">
                  {t.paymentMethod}
                </Label>
                <div className="space-y-2">
                  {['cash', 'bank'].map((method) => (
                    <label
                      key={method}
                      className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all border-slate-200 dark:border-slate-700 hover:border-primary/50"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank')}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 font-medium text-slate-900 dark:text-white">
                        {method === 'cash' ? t.cash : t.bank}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Paid To (for cash) */}
              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <Label htmlFor="paidTo" className="text-base font-semibold">
                    {t.paidTo}
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {t.paidToDesc}
                  </p>
                  <Input
                    id="paidTo"
                    type="text"
                    placeholder="e.g., John Doe"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="rounded-lg"
                    required
                  />
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="slip" className="text-base font-semibold">
                  {t.depositSlip}
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {t.depositSlipDesc}
                </p>
                <div className="relative">
                  <Input
                    id="slip"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="rounded-lg"
                    required
                  />
                  {depositSlip && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ {depositSlip.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">
                  {t.notes}
                </Label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {t.notesDesc}
                </p>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Paid in two installments..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                  rows={3}
                />
              </div>

              {/* Status Info */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-400">
                  <span className="font-semibold">{t.status}:</span> {t.pending}
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || selectedMonths.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  {loading ? (
                    <>
                      <Spinner /> {t.submitting}
                    </>
                  ) : (
                    t.submit
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Info */}
        <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-400 text-sm">
              ℹ️ {language === 'en' ? 'How it Works' : 'কীভাবে কাজ করে'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900 dark:text-blue-400 space-y-2 text-sm">
            <p>
              {language === 'en'
                ? '1. Select the months you want to deposit for'
                : '১. আপনি যে মাসগুলির জন্য জমা দিতে চান তা নির্বাচন করুন'}
            </p>
            <p>
              {language === 'en'
                ? '2. Amount will be automatically calculated'
                : '২. পরিমাণ স্বয়ংক্রিয়ভাবে গণনা করা হবে'}
            </p>
            <p>
              {language === 'en'
                ? '3. Choose payment method (Cash or Bank)'
                : '৩. পেমেন্ট পদ্ধতি নির্বাচন করুন (নগদ বা ব্যাংক)'}
            </p>
            <p>
              {language === 'en'
                ? '4. Upload your receipt'
                : '৪. আপনার রসিদ আপলোড করুন'}
            </p>
            <p>
              {language === 'en'
                ? '5. Submit for manager confirmation'
                : '৫. ম্যানেজার নিশ্চিতকরণের জন্য জমা দিন'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
