'use client';

import { useState, useEffect } from 'react';
import { useRouteGuard } from '@/lib/use-route-guard';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Member {
  id: string;
  full_name: string;
  email: string;
  is_accountant: boolean;
  phone: string;
}

export default function AccountantAssignmentPage() {
  const { canAccess, isLoading } = useRouteGuard();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (canAccess) {
      fetchMembers();
    }
  }, [canAccess]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_accountant, phone')
        .eq('is_approved', true)
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load members',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountant = async (memberId: string, currentStatus: boolean) => {
    try {
      setAssigning(memberId);
      const { error } = await supabase
        .from('profiles')
        .update({ is_accountant: !currentStatus })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: currentStatus
          ? 'Accountant role removed'
          : 'Accountant role assigned',
      });

      fetchMembers();
    } catch (error) {
      console.error('Error updating accountant:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update accountant role',
      });
    } finally {
      setAssigning(null);
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
            <CardDescription>
              Only the fund owner can assign accountant roles.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assign Accountant</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage who can view financial reports and transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fund Members</CardTitle>
          <CardDescription>
            {members.length} approved member{members.length !== 1 ? 's' : ''} in the fund
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400 py-8">
              No approved members found
            </p>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {member.full_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {member.email}
                    </p>
                    {member.phone && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {member.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {member.is_accountant && (
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-0">
                        💰 Accountant
                      </Badge>
                    )}
                    <Button
                      onClick={() => toggleAccountant(member.id, member.is_accountant)}
                      disabled={assigning === member.id}
                      variant={member.is_accountant ? 'destructive' : 'default'}
                      size="sm"
                    >
                      {assigning === member.id ? (
                        <>
                          <Spinner /> Updating...
                        </>
                      ) : member.is_accountant ? (
                        'Remove'
                      ) : (
                        'Assign'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-400">ℹ️ About Accountants</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 dark:text-blue-400 space-y-2 text-sm">
          <p>
            Accountants can:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>View all financial transactions</li>
            <li>Generate financial reports</li>
            <li>Monitor contribution & loan records</li>
            <li>Access audit logs</li>
          </ul>
          <p className="mt-4">
            Only the fund owner can assign or revoke accountant roles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
