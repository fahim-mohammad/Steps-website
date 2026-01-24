'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from './auth-context'
import { canAccessRoute, getRedirectUrl } from './route-guards'

/**
 * Hook to protect routes based on user role
 * Redirects unauthorized users gracefully
 */
export function useRouteGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, approvalStatus, loading } = useAuth()

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return

    // Check if user can access current route
    const canAccess = canAccessRoute(role, pathname)

    if (!canAccess) {
      // Get appropriate redirect URL
      const redirectUrl = getRedirectUrl(role, approvalStatus, pathname)
      
      // Only redirect if different from current
      if (redirectUrl !== pathname) {
        router.push(redirectUrl)
      }
    }
  }, [user, role, approvalStatus, loading, pathname, router])

  return {
    canAccess: canAccessRoute(role, pathname),
    isLoading: loading,
    userRole: role,
  }
}

/**
 * Hook to check a specific permission
 */
export function useHasPermission(permission: string) {
  const { role } = useAuth()

  if (!role) return false

  const permissions: Record<string, Record<string, boolean>> = {
    member: {
      canAccessDashboard: true,
      canViewMembers: false,
      canApprovemembers: false,
      canManageLoans: false,
      canManageContributions: false,
      canGenerateReports: false,
      canAssignRoles: false,
      canAssignAccountant: false,
      canManageSettings: false,
    },
    manager: {
      canAccessDashboard: true,
      canViewMembers: true,
      canApprovemembers: true,
      canManageLoans: true,
      canManageContributions: true,
      canGenerateReports: true,
      canAssignRoles: true,
      canAssignAccountant: false,
      canManageSettings: true,
    },
    owner: {
      canAccessDashboard: true,
      canViewMembers: true,
      canApprovemembers: true,
      canManageLoans: true,
      canManageContributions: true,
      canGenerateReports: true,
      canAssignRoles: true,
      canAssignAccountant: true,
      canManageSettings: true,
    },
  }

  return permissions[role]?.[permission] ?? false
}
