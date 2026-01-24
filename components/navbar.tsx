'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { MobileNavMenu } from '@/components/mobile-nav-menu'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={isAuthenticated ? `/${profile?.role}/dashboard` : '/'} className="flex items-center gap-2 hover:opacity-80 transition">
          <Image
            src="/steps-logo.png"
            alt="STEPS Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="hidden sm:inline font-bold text-lg">STEPS</span>
        </Link>

        {/* Mobile Navigation */}
        {isAuthenticated && <MobileNavMenu role={profile?.role} userName={profile?.full_name} userEmail={user?.email} />}

        {/* Desktop Navigation */}
        {!isAuthenticated && (
          <div className="hidden gap-8 md:flex">
            <a href="/#features" className="text-foreground/70 hover:text-foreground transition">
              Features
            </a>
            <a href="/#mission" className="text-foreground/70 hover:text-foreground transition">
              How it Works
            </a>
            <a href="/#about" className="text-foreground/70 hover:text-foreground transition">
              About
            </a>
          </div>
        )}

        {/* Right side: Toggles + Auth */}
        <div className="flex gap-2 items-center">
          {/* Theme & Language Toggles */}
          <ThemeToggle />
          <LanguageToggle />

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="hidden sm:inline">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup" className="hidden sm:inline">
                <Button>Get Started</Button>
              </Link>
            </>
          ) : (
            <Button onClick={handleLogout} variant="ghost" className="hidden sm:inline">
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
