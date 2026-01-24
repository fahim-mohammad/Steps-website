'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { setUserLanguage, getLocalLanguage } from '@/lib/user-preferences';
import { useAuth } from '@/lib/auth-context';

type Language = 'en' | 'bn';

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    const currentLanguage = getLocalLanguage() || 'en';
    setLanguage(currentLanguage as Language);
  }, []);

  const toggleLanguage = async () => {
    if (!mounted) return;

    const nextLanguage: Language = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLanguage);

    // Save to database if user is logged in
    if (user?.id) {
      try {
        await setUserLanguage(user.id, nextLanguage);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    } else {
      // Save to localStorage only
      localStorage.setItem('language', nextLanguage);
      document.documentElement.lang = nextLanguage;
    }
  };

  if (!mounted) return null;

  const labels = {
    en: 'EN',
    bn: 'BN',
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex items-center gap-1"
      title={`Switch to ${language === 'en' ? 'Bangla' : 'English'}`}
      aria-label="Toggle language"
    >
      <Globe size={20} className="text-gray-700 dark:text-gray-300" />
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{labels[language]}</span>
    </button>
  );
}
