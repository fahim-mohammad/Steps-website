// lib/user-preferences.ts
// User language and theme preferences

import { supabase } from './supabase';

export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark' | 'system';

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<{ language: Language; theme: Theme } | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('language, theme')
      .eq('id', userId)
      .single();

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        return { language: 'en', theme: 'system' };
      }
      throw error;
    }

    return data || { language: 'en', theme: 'system' };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { language: 'en', theme: 'system' };
  }
}

/**
 * Update user language preference
 */
export async function setUserLanguage(userId: string, language: Language): Promise<boolean> {
  try {
    // First try to update
    const { error: updateError } = await supabase
      .from('user_preferences')
      .update({ language })
      .eq('id', userId);

    // If no row exists, insert
    if (updateError?.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({ id: userId, language });

      if (insertError) throw insertError;
    } else if (updateError) {
      throw updateError;
    }

    // Also save to localStorage for immediate effect
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }

    console.log(`✅ Language set to ${language}`);
    return true;
  } catch (error) {
    console.error('Error setting language:', error);
    return false;
  }
}

/**
 * Update user theme preference
 */
export async function setUserTheme(userId: string, theme: Theme): Promise<boolean> {
  try {
    // First try to update
    const { error: updateError } = await supabase
      .from('user_preferences')
      .update({ theme })
      .eq('id', userId);

    // If no row exists, insert
    if (updateError?.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({ id: userId, theme });

      if (insertError) throw insertError;
    } else if (updateError) {
      throw updateError;
    }

    // Also save to localStorage for immediate effect
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }

    console.log(`✅ Theme set to ${theme}`);
    return true;
  } catch (error) {
    console.error('Error setting theme:', error);
    return false;
  }
}

/**
 * Get language from localStorage (for immediate UI updates)
 */
export function getLocalLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('language') as Language) || 'en';
}

/**
 * Get theme from localStorage
 */
export function getLocalTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const html = document.documentElement;

  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'light') {
    html.classList.remove('dark');
  } else {
    // system - respect OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}

/**
 * Initialize theme on page load
 */
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const theme = getLocalTheme();
  applyTheme(theme);

  // Listen for system theme changes
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeQuery.addEventListener('change', (e) => {
    if (getLocalTheme() === 'system') {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
