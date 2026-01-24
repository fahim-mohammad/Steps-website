'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin-sidebar';
import { Card } from '@/components/ui/card';
import { getCurrentUser, getTransactions, getUsers } from '@/lib/storage';
import type { User, Transaction } from '@/lib/types';

export default function AdminTransactions() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    const allTransactions = getTransactions();
    setTransactions(allTransactions.reverse());
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const typeColors: Record<string, { bg: string; text: string }> = {
    deposit: { bg: 'bg-blue-100', text: 'text-blue-800' },
    contribution: { bg: 'bg-green-100', text: 'text-green-800' },
    loan: { bg: 'bg-purple-100', text: 'text-purple-800' },
    repayment: { bg: 'bg-orange-100', text: 'text-orange-800' },
    dividend: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="mt-2 text-foreground/70">View all fund transactions</p>
          </div>

          {/* Summary Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Transactions</h3>
              <p className="mt-2 text-3xl font-bold text-primary">{transactions.length}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Amount</h3>
              <p className="mt-2 text-3xl font-bold text-secondary">
                ৳{totalAmount.toLocaleString()}
              </p>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-bold text-foreground">All Transactions</h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-foreground/70">Date</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Type</th>
                      <th className="px-4 py-3 text-left text-foreground/70">User</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Description</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Reference</th>
                      <th className="px-4 py-3 text-right text-foreground/70">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => {
                      const user = getUsers().find((u) => u.id === txn.userId);
                      const colors = typeColors[txn.type] || typeColors.deposit;
                      return (
                        <tr key={txn.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">{txn.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                            >
                              {txn.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{user?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 text-foreground/70">{txn.description || '-'}</td>
                          <td className="px-4 py-3 text-foreground/70">{txn.reference || '-'}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            ৳{txn.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
