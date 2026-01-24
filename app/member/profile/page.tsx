'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, saveUser } from '@/lib/storage';
import type { User } from '@/lib/types';

export default function MemberProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || '',
    });
    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone,
      };

      saveUser(updatedUser);
      setUser(updatedUser);
      setSaved(true);

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <MemberSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="mt-2 text-foreground/70">Manage your account information</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Info Card */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="mb-6 text-lg font-bold text-foreground">Personal Information</h2>

              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-foreground/50">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+880 1XXX XXXXXX"
                  />
                </div>

                {saved && (
                  <div className="rounded-lg bg-green-100 p-3 text-sm text-green-800">
                    Profile updated successfully
                  </div>
                )}

                <Button onClick={handleSave}>Save Changes</Button>
              </form>
            </Card>

            {/* Account Statistics */}
            <Card className="p-6">
              <h2 className="mb-6 text-lg font-bold text-foreground">Account Summary</h2>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-foreground/70">Current Balance</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    ৳{user.balance.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-foreground/70">Total Contributed</p>
                  <p className="mt-1 text-2xl font-bold text-secondary">
                    ৳{user.totalContributed.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-foreground/70">Member Since</p>
                  <p className="mt-1 font-medium text-foreground">{user.joinDate}</p>
                </div>

                <div>
                  <p className="text-sm text-foreground/70">Role</p>
                  <p className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
