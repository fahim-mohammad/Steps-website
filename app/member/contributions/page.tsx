'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCurrentUser,
  getContributions,
  saveContribution,
  saveTransaction,
  saveUser,
} from '@/lib/storage';
import type { User, Contribution, Transaction } from '@/lib/types';

export default function ContributionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    const userContributions = getContributions(currentUser.id);
    setContributions(userContributions);
    setLoading(false);
  }, [router]);

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    try {
      const contributionAmount = parseFloat(amount);

      // Create contribution record
      const contribution: Contribution = {
        id: `contrib-${Date.now()}`,
        userId: user.id,
        fundId: 'fund-1',
        amount: contributionAmount,
        date: new Date().toISOString().split('T')[0],
        month: new Date().toISOString().slice(0, 7),
        verified: false,
        createdAt: new Date().toISOString(),
      };

      // Create transaction record
      const transaction: Transaction = {
        id: `txn-${Date.now()}`,
        userId: user.id,
        fundId: 'fund-1',
        type: 'contribution',
        amount: contributionAmount,
        date: new Date().toISOString().split('T')[0],
        description: 'Monthly contribution',
        createdAt: new Date().toISOString(),
      };

      // Update user balance
      const updatedUser = {
        ...user,
        balance: user.balance + contributionAmount,
        totalContributed: user.totalContributed + contributionAmount,
      };

      // Save everything
      saveContribution(contribution);
      saveTransaction(transaction);
      saveUser(updatedUser);
      setUser(updatedUser);

      // Update contributions list
      setContributions([...contributions, contribution]);
      setAmount('');
      setSubmitted(true);

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Error submitting contribution:', err);
    }
  };

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const pendingContributions = contributions.filter((c) => !c.verified).length;
  const verifiedContributions = contributions.filter((c) => c.verified).length;

  return (
    <div className="flex h-screen bg-background">
      <MemberSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Contributions</h1>
            <p className="mt-2 text-foreground/70">Track and manage your fund contributions</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Contributed</h3>
              <p className="mt-2 text-3xl font-bold text-primary">
                ৳{user.totalContributed.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Verified</h3>
              <p className="mt-2 text-3xl font-bold text-secondary">{verifiedContributions}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Pending Verification</h3>
              <p className="mt-2 text-3xl font-bold text-accent">{pendingContributions}</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contribution Form */}
            <Card className="lg:col-span-1 p-6">
              <h2 className="mb-6 text-lg font-bold text-foreground">Make Contribution</h2>

              <form onSubmit={handleSubmitContribution} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="100"
                    required
                  />
                </div>

                {submitted && (
                  <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">
                    Contribution submitted successfully!
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Submit Contribution
                </Button>
              </form>
            </Card>

            {/* Contributions History */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="mb-6 text-lg font-bold text-foreground">Contribution History</h2>

              {contributions.length === 0 ? (
                <p className="text-foreground/70">No contributions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left text-foreground/70">Date</th>
                        <th className="px-4 py-2 text-left text-foreground/70">Month</th>
                        <th className="px-4 py-2 text-right text-foreground/70">Amount</th>
                        <th className="px-4 py-2 text-left text-foreground/70">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.map((contrib) => (
                        <tr key={contrib.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2">{contrib.date}</td>
                          <td className="px-4 py-2">{contrib.month}</td>
                          <td className="px-4 py-2 text-right font-medium">
                            ৳{contrib.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                contrib.verified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {contrib.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
