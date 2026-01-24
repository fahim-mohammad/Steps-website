'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Member {
  id: string;
  full_name: string;
  email: string;
  total_contribution: number;
}

export default function MembersListPage() {
  const { user, loading: authLoading } = useAuth();
  const language = 'en'; // Default to English
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Translations
  const translations = {
    en: {
      title: 'Community Members',
      description: 'View all active members of the STEPS fund',
      notLoggedIn: 'Please log in to view members',
      search: 'Search members...',
      name: 'Member Name',
      email: 'Email',
      contribution: 'Total Contribution',
      noMembers: 'No members found',
      members: 'members',
      active: 'Active Members',
      loginPrompt: 'Log in to continue',
      signIn: 'Sign In',
    },
    bn: {
      title: 'সম্প্রদায়ের সদস্যরা',
      description: 'STEPS ফান্ডের সকল সক্রিয় সদস্যদের দেখুন',
      notLoggedIn: 'সদস্যদের দেখতে লগইন করুন',
      search: 'সদস্য খুঁজুন...',
      name: 'সদস্যের নাম',
      email: 'ইমেইল',
      contribution: 'মোট অবদান',
      noMembers: 'কোনো সদস্য খুঁজে পাওয়া যায়নি',
      members: 'সদস্য',
      active: 'সক্রিয় সদস্যরা',
      loginPrompt: 'চালিয়ে যেতে লগইন করুন',
      signIn: 'সাইন ইন করুন',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (!authLoading && user) {
      fetchMembers();
    }
  }, [user, authLoading]);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      // Fetch approved members with their total contributions
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_approved')
        .eq('is_approved', true)
        .order('full_name');

      if (!profiles) {
        setMembers([]);
        return;
      }

      // Fetch contributions for each member
      const membersWithContributions = await Promise.all(
        profiles.map(async (profile) => {
          const { data: contributions } = await supabase
            .from('contributions')
            .select('amount')
            .eq('member_id', profile.id);

          const total_contribution = contributions
            ? contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
            : 0;

          return {
            id: profile.id,
            full_name: profile.full_name || 'Unknown',
            email: profile.email || '',
            total_contribution,
          };
        })
      );

      setMembers(membersWithContributions);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter(
    (member) =>
      member.full_name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
  );

  // If not logged in, show login prompt
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.notLoggedIn}</CardTitle>
            <CardDescription>{t.loginPrompt}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <button className="w-full rounded-lg bg-primary text-white py-2 font-medium hover:bg-primary/90 transition-colors">
                {t.signIn}
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t.description}
          </p>
        </div>

        {/* Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t.active}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {members.length}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {members.length} {t.members}
            </p>
          </CardContent>
        </Card>

        {/* Members Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <Input
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                {t.noMembers}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <TableHead className="text-slate-900 dark:text-white font-semibold">
                        {t.name}
                      </TableHead>
                      <TableHead className="text-slate-900 dark:text-white font-semibold hidden sm:table-cell">
                        {t.email}
                      </TableHead>
                      <TableHead className="text-right text-slate-900 dark:text-white font-semibold">
                        {t.contribution}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member, index) => (
                      <TableRow
                        key={member.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {index + 1}
                            </div>
                            {member.full_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                          {member.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-0 font-semibold">
                            ৳{member.total_contribution.toLocaleString()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary */}
            {filteredMembers.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {filteredMembers.length} of {members.length} {t.members.toLowerCase()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-400 text-sm">
              ℹ️ {language === 'en' ? 'About This Page' : 'এই পৃষ্ঠা সম্পর্কে'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900 dark:text-blue-400 space-y-2 text-sm">
            <p>
              {language === 'en'
                ? '• This page shows all active members and their total contributions'
                : '• এই পৃষ্ঠায় সমস্ত সক্রিয় সদস্য এবং তাদের মোট অবদান দেখানো হয়'}
            </p>
            <p>
              {language === 'en'
                ? '• Use the search box to find a specific member'
                : '• একজন নির্দিষ্ট সদস্য খুঁজতে সার্চ বক্স ব্যবহার করুন'}
            </p>
            <p>
              {language === 'en'
                ? '• Only members who have been approved can be seen'
                : '• শুধুমাত্র অনুমোদিত সদস্যরা দেখা যায়'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
