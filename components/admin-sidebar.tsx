'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  // Base items accessible to managers/owners
  const baseNavItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Approve Members', href: '/admin/approve-members' },
    { label: 'Members', href: '/admin/members' },
    { label: 'Contributions', href: '/admin/contributions' },
    { label: 'Loans', href: '/admin/loans' },
    { label: 'Reports', href: '/admin/reports' },
    { label: 'Settings', href: '/admin/settings' },
  ];

  // Owner-only items
  const ownerNavItems = [
    { label: 'Assign Accountant', href: '/admin/accountant' },
  ];

  const navItems = profile?.is_owner ? [...baseNavItems, ...ownerNavItems] : baseNavItems;

  return (
    <div className="flex h-screen flex-col border-r bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b px-6 py-4 bg-white dark:bg-slate-900">
        <Image
          src="/steps-logo.png"
          alt="STEPS Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <span className="font-bold text-slate-900 dark:text-white">STEPS</span>
      </div>

      {/* User Info */}
      {profile && (
        <div className="border-b px-6 py-4 bg-white dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.full_name}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{profile.email}</p>
          <div className="mt-2 flex gap-2">
            {profile.is_owner && (
              <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-1 text-xs font-semibold text-amber-800 dark:text-amber-400">
                👑 Owner
              </span>
            )}
            {profile.is_manager && !profile.is_owner && (
              <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs font-semibold text-blue-800 dark:text-blue-400">
                📊 Manager
              </span>
            )}
            {profile.is_accountant && (
              <span className="inline-block rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-400">
                💰 Accountant
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t bg-white dark:bg-slate-900 p-4">
        <Button
          onClick={handleLogout}
          className="w-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

