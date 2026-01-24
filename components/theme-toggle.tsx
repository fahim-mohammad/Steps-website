'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme, getLocalTheme } from '@/lib/user-preferences';
import { useAuth } from '@/lib/auth-context';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    const currentTheme = getLocalTheme();
    setTheme(currentTheme);
  }, []);

  const toggleTheme = async () => {
    if (!mounted) return;

    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    setTheme(nextTheme);

    // Apply theme to DOM
    applyTheme(nextTheme);

    // Save to database if user is logged in
    if (user?.id) {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: nextTheme }),
        });

        if (!response.ok) {
          console.error('Failed to save theme preference');
        }
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
      title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-gray-700" />
      ) : theme === 'dark' ? (
        <Sun size={20} className="text-gray-300" />
      ) : (
        <Sun size={20} className="text-gray-700" />
      )}
    </button>
  );
}
