'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member-sidebar';
import { Card } from '@/components/ui/card';
import { getCurrentUser, getTransactions } from '@/lib/storage';
import type { Transaction, User } from '@/lib/types';

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    const userTransactions = getTransactions(currentUser.id);
    setTransactions(userTransactions.reverse());
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const typeColors: Record<string, { bg: string; text: string }> = {
    deposit: { bg: 'bg-blue-100', text: 'text-blue-800' },
    contribution: { bg: 'bg-green-100', text: 'text-green-800' },
    loan: { bg: 'bg-purple-100', text: 'text-purple-800' },
    repayment: { bg: 'bg-orange-100', text: 'text-orange-800' },
    dividend: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  };

  return (
    <div className="flex h-screen bg-background">
      <MemberSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="mt-2 text-foreground/70">View all your fund transactions and activity</p>
          </div>

          <Card className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                        Reference
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => {
                      const colors = typeColors[txn.type] || typeColors.deposit;
                      return (
                        <tr
                          key={txn.id}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm">{txn.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                            >
                              {txn.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{txn.description || '-'}</td>
                          <td className="px-4 py-3 text-sm text-foreground/70">
                            {txn.reference || '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            +৳{txn.amount.toLocaleString()}
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
