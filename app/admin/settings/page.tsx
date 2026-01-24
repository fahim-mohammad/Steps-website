'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, getFunds, saveUser } from '@/lib/storage';
import type { User, Fund } from '@/lib/types';

export default function AdminSettings() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fund, setFund] = useState<Fund | null>(null);
  const [fundData, setFundData] = useState({
    name: '',
    description: '',
    monthlyTarget: '',
  });
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || (user.role !== 'owner' && user.role !== 'manager')) {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setPersonalData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    });

    const funds = getFunds();
    if (funds.length > 0) {
      setFund(funds[0]);
      setFundData({
        name: funds[0].name,
        description: funds[0].description,
        monthlyTarget: funds[0].monthlyTarget?.toString() || '',
      });
    }

    setLoading(false);
  }, [router]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFundChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFundData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePersonal = async () => {
    if (!currentUser) return;

    try {
      const updatedUser = {
        ...currentUser,
        name: personalData.name,
        phone: personalData.phone,
      };

      saveUser(updatedUser);
      setCurrentUser(updatedUser);
      setSaved(true);

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving personal settings:', err);
    }
  };

  if (loading || !currentUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-2 text-foreground/70">Manage fund and personal settings</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Personal Settings */}
            <Card className="p-6">
              <h2 className="mb-6 text-lg font-bold text-foreground">Personal Information</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={personalData.name}
                    onChange={handlePersonalChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={personalData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-foreground/50">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={personalData.phone}
                    onChange={handlePersonalChange}
                  />
                </div>

                {saved && (
                  <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">
                    Settings saved successfully
                  </div>
                )}

                <Button onClick={handleSavePersonal}>Save Changes</Button>
              </div>
            </Card>

            {/* Fund Settings */}
            {fund && (
              <Card className="p-6">
                <h2 className="mb-6 text-lg font-bold text-foreground">Fund Information</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fundName">Fund Name</Label>
                    <Input
                      id="fundName"
                      name="name"
                      value={fundData.name}
                      onChange={handleFundChange}
                      disabled
                    />
                    <p className="text-xs text-foreground/50">Cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={fundData.description}
                      onChange={handleFundChange}
                      disabled
                      className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                      rows={3}
                    />
                    <p className="text-xs text-foreground/50">Description cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Fund Status</Label>
                    <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Total Members</Label>
                    <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {fund.totalMembers}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* System Information */}
          <Card className="mt-6 p-6">
            <h2 className="mb-6 text-lg font-bold text-foreground">System Information</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-foreground/70">Version</p>
                <p className="mt-1 font-medium text-foreground">1.0.0</p>
              </div>

              <div>
                <p className="text-sm text-foreground/70">Last Updated</p>
                <p className="mt-1 font-medium text-foreground">
                  {new Date().toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/70">Environment</p>
                <p className="mt-1 font-medium text-foreground">Production</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
