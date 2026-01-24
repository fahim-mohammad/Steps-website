'use client';

import { useState, useEffect } from 'react';
import { useRouteGuard } from '@/lib/use-route-guard';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_approved: boolean;
  is_manager: boolean;
  is_accountant: boolean;
  created_at: string;
}

export default function MembersPage() {
  const { canAccess, isLoading } = useRouteGuard();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (canAccess) {
      fetchMembers();
    }
  }, [canAccess]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

      if (filter === 'approved') {
        query = query.eq('is_approved', true);
      } else if (filter === 'pending') {
        query = query.eq('is_approved', false);
      }

      const { data, error } = await query;

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

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

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
          </CardHeader>
        </Card>
      </div>
    );
  }

  const approvedCount = members.filter(m => m.is_approved).length;
  const pendingCount = members.filter(m => !m.is_approved).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage and monitor all fund members
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {approvedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>
            View and manage member information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              {(['all', 'approved', 'pending'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter(f);
                    setSearch('');
                  }}
                  className="capitalize"
                >
                  {f === 'all' ? 'All Members' : f === 'approved' ? '✓ Approved' : '⏳ Pending'}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400 py-8">
              No members found
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell className="text-sm">{member.email}</TableCell>
                      <TableCell className="text-sm">{member.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={member.is_approved ? 'default' : 'secondary'}>
                          {member.is_approved ? '✓ Approved' : '⏳ Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1 flex-wrap">
                        {member.is_manager && (
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-0">
                            Manager
                          </Badge>
                        )}
                        {member.is_accountant && (
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-0">
                            Accountant
                          </Badge>
                        )}
                        {!member.is_manager && !member.is_accountant && (
                          <Badge variant="outline">Member</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Members</h1>
                <p className="text-gray-600 mt-2">
                  Total members: {members.length}
                </p>
              </div>
              <Link href="/admin/members/new">
                <Button>Add New Member</Button>
              </Link>
            </div>

            {/* Search */}
            <Card className="p-4">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </Card>

            {/* Members Table */}
            <Card className="overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading members...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No members found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Contributed</TableHead>
                      <TableHead>Borrowed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.full_name}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || '-'}</TableCell>
                        <TableCell>
                          {new Date(member.join_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          ${member.total_contributed.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          ${member.total_borrowed.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/admin/members/${member.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Members Management</h1>
            <p className="mt-2 text-foreground/70">Manage fund members and their roles</p>
          </div>

          {/* Summary Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Members</h3>
              <p className="mt-2 text-3xl font-bold text-primary">{members.length}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Total Balance</h3>
              <p className="mt-2 text-3xl font-bold text-secondary">
                ৳{totalBalance.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-foreground/70">Owners & Managers</h3>
              <p className="mt-2 text-3xl font-bold text-accent">
                {members.filter((m) => m.role !== 'member').length}
              </p>
            </Card>
          </div>

          {/* Members Table */}
          <Card className="p-6">
            <h2 className="mb-6 text-lg font-bold text-foreground">All Members</h2>

            {members.length === 0 ? (
              <p className="text-foreground/70">No members yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-foreground/70">Name</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Email</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Phone</th>
                      <th className="px-4 py-3 text-right text-foreground/70">Balance</th>
                      <th className="px-4 py-3 text-right text-foreground/70">Contributed</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Role</th>
                      <th className="px-4 py-3 text-left text-foreground/70">Joined</th>
                      <th className="px-4 py-3 text-center text-foreground/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{member.name}</td>
                        <td className="px-4 py-3 text-foreground/70">{member.email}</td>
                        <td className="px-4 py-3 text-foreground/70">{member.phone || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          ৳{member.balance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          ৳{member.totalContributed.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                            disabled={member.id === currentUser.id && currentUser.role !== 'owner'}
                            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                          >
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                            {currentUser.role === 'owner' && (
                              <option value="owner">Owner</option>
                            )}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-foreground/70">{member.joinDate}</td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
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
