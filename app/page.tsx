'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Stats {
  totalMembers: number;
  totalContributed: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalContributed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const membersResponse = await fetch('/api/members');
      let membersData = await membersResponse.json();
      
      // Ensure membersData is an array
      if (!Array.isArray(membersData)) {
        membersData = [];
      }
      
      const totalMembers = membersData.length;

      let totalContributed = 0;
      for (const member of membersData) {
        try {
          const contribResponse = await fetch(`/api/contributions?memberId=${member.id}`);
          const contribData = await contribResponse.json();
          
          // Ensure contribData is an array
          if (Array.isArray(contribData)) {
            totalContributed += contribData
              .filter((c: any) => c.status === 'completed')
              .reduce((sum: number, c: any) => sum + c.amount, 0);
          }
        } catch (err) {
          console.error(`Error fetching contributions for member ${member.id}:`, err);
        }
      }

      setStats({
        totalMembers,
        totalContributed,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Take STEPS Toward a Better Financial Future
          </h1>
          <p className="mt-6 text-balance text-lg text-foreground/70 sm:text-xl">
            STEPS: Secure, Transparent, and Collaborative community fund management. Track contributions, manage loans, and build wealth together for a better future.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Fund
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-bold text-primary sm:text-3xl">
                {loading ? '...' : stats.totalMembers}
              </div>
              <div className="text-sm text-foreground/70">Active Members</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-bold text-primary sm:text-3xl">
                {loading ? '...' : `৳${stats.totalContributed.toLocaleString()}`}
              </div>
              <div className="text-sm text-foreground/70">Funds Managed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
            Powerful Features
          </h2>
          <p className="mt-4 text-center text-foreground/70">
            Everything you need to manage your community fund
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Transparent Tracking',
                description: 'Real-time transaction tracking and balance updates for all members',
                icon: '📊',
              },
              {
                title: 'Secure Storage',
                description: 'Bank-level security to protect your community funds and data',
                icon: '🔒',
              },
              {
                title: 'Contribution Management',
                description: 'Automated contribution tracking with verification and reporting',
                icon: '💰',
              },
              {
                title: 'Loan Management',
                description: 'Easy loan requests and management with clear repayment schedules',
                icon: '📋',
              },
              {
                title: 'Member Profiles',
                description: 'Detailed member information and contribution history',
                icon: '👥',
              },
              {
                title: 'Admin Dashboard',
                description: 'Complete control panel for fund managers and administrators',
                icon: '⚙️',
              },
            ].map((feature) => (
              <Card key={feature.title} className="flex flex-col items-start gap-4 p-6">
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
            How It Works
          </h2>

          <div className="mt-12 space-y-8">
            {[
              {
                step: '1',
                title: 'Create Your Fund',
                description: 'Set up your community fund with fund name, description, and target amount',
              },
              {
                step: '2',
                title: 'Invite Members',
                description: 'Add members to your fund and assign roles (Owner, Manager, Member)',
              },
              {
                step: '3',
                title: 'Make Contributions',
                description: 'Members contribute money to the fund on a regular basis',
              },
              {
                step: '4',
                title: 'Request Loans',
                description: 'Members can request loans from the fund when needed',
              },
              {
                step: '5',
                title: 'Track Everything',
                description: 'Monitor all transactions, contributions, and loan repayments',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-foreground/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
            Why Choose STEPS?
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              { title: 'Transparent', desc: 'Complete visibility into all fund activities' },
              { title: 'Secure', desc: 'Industry-standard security measures' },
              { title: 'Easy to Use', desc: 'Simple interface suitable for all users' },
              { title: 'Affordable', desc: 'No hidden fees, transparent pricing' },
              { title: 'Flexible', desc: 'Supports various fund types and structures' },
              { title: 'Reliable', desc: '99.9% uptime guarantee' },
            ].map((benefit) => (
              <div key={benefit.title} className="rounded-lg border p-6">
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-foreground/70">
            Create your community fund today and start managing your finances together
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create Fund Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Already a Member?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 font-bold">
                <Image 
                  src="/steps-logo.png"
                  alt="STEPS Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span>STEPS</span>
              </Link>
              <p className="mt-2 text-sm text-foreground/70">
                Take steps toward a better financial future
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground">How it works</Link></li>
                <li><Link href="#benefits" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-foreground/70">
            <p>© 2026 STEPS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
