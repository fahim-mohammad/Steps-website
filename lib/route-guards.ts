/**
 * STEPS Fund - Route Guards & Role-Based Access Control
 * 
 * Defines permissions for different roles:
 * - member: Basic member access only
 * - manager: Manager permissions (can manage members, approve, etc.) - NO accountant assignment
 * - owner: Full permissions (same as manager + accountant assignment)
 */

export type UserRole = 'member' | 'manager' | 'owner'

/**
 * Role-based route access permissions
 */
export const rolePermissions: Record<UserRole, {
  canAccessDashboard: boolean
  canViewMembers: boolean
  canApprovemembers: boolean
  canManageLoans: boolean
  canManageContributions: boolean
  canGenerateReports: boolean
  canAssignRoles: boolean
  canAssignAccountant: boolean
  canManageSettings: boolean
}> = {
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
    canAssignAccountant: false, // Manager CANNOT assign accountant
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
    canAssignAccountant: true, // Only owner can assign accountant
    canManageSettings: true,
  },
}

/**
 * Protected routes configuration
 * Maps route patterns to required role
 */
export const protectedRoutes: Record<string, {
  requiredRole: UserRole | UserRole[]
  public: boolean
  description: string
}> = {
  '/member/dashboard': {
    requiredRole: 'member',
    public: false,
    description: 'Member Dashboard - For approved members',
  },
  '/member/profile': {
    requiredRole: 'member',
    public: false,
    description: 'Member Profile',
  },
  '/member/contributions': {
    requiredRole: 'member',
    public: false,
    description: 'Member Contributions',
  },
  '/member/loans': {
    requiredRole: 'member',
    public: false,
    description: 'Member Loans',
  },
  '/member/transactions': {
    requiredRole: 'member',
    public: false,
    description: 'Member Transactions',
  },
  '/admin/dashboard': {
    requiredRole: ['manager', 'owner'],
    public: false,
    description: 'Admin Dashboard',
  },
  '/admin/approve-members': {
    requiredRole: ['manager', 'owner'],
    public: false,
    description: 'Approve Members',
  },
  '/admin/members': {
    requiredRole: ['manager', 'owner'],
    public: false,
    description: 'Manage Members',
  },
  '/admin/loans': {
    requiredRole: ['manager', 'owner'],
    public: false,
    description: 'Manage Loans',
  },
  '/admin/contributions': {
    requiredRole: ['manager', 'owner'],
    public: false,
    description: 'Manage Contributions',
  },
  '/admin/reports': {
    requiredRole: ['manager', 'owner'],
    public: false,
    description: 'Generate Reports',
  },
  '/admin/settings': {
    requiredRole: ['manager', 'owner'],
    public: false,
    description: 'Fund Settings',
  },
  '/admin/accountant': {
    requiredRole: 'owner',
    public: false,
    description: 'Assign Accountant (Owner only)',
  },
  '/login': {
    requiredRole: [],
    public: true,
    description: 'Login Page',
  },
  '/signup': {
    requiredRole: [],
    public: true,
    description: 'Sign Up Page',
  },
  '/pending-approval': {
    requiredRole: [],
    public: true,
    description: 'Pending Approval Page',
  },
  '/': {
    requiredRole: [],
    public: true,
    description: 'Home Page',
  },
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(
  userRole: UserRole | null,
  permission: keyof typeof rolePermissions.member
): boolean {
  if (!userRole) return false
  return rolePermissions[userRole][permission]
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
  userRole: UserRole | null,
  pathname: string
): boolean {
  // Find matching route config
  const routeConfig = Object.entries(protectedRoutes).find(
    ([route]) => pathname.startsWith(route)
  )?.[1]

  // Public routes are always accessible
  if (!routeConfig || routeConfig.public) {
    return true
  }

  // No user = no access to protected routes
  if (!userRole) {
    return false
  }

  // Check role access
  const requiredRoles = Array.isArray(routeConfig.requiredRole)
    ? routeConfig.requiredRole
    : [routeConfig.requiredRole]

  return requiredRoles.includes(userRole)
}

/**
 * Get the route to redirect to based on role
 */
export function getDefaultRoute(userRole: UserRole | null): string {
  if (!userRole) {
    return '/login'
  }

  switch (userRole) {
    case 'member':
      return '/member/dashboard'
    case 'manager':
    case 'owner':
      return '/admin/dashboard'
    default:
      return '/login'
  }
}

/**
 * Check if user needs to complete approval
 */
export function needsApproval(
  approvalStatus: string | null,
  role: UserRole | null
): boolean {
  return role === 'member' && approvalStatus === 'pending'
}

/**
 * Get redirect URL based on access attempt
 */
export function getRedirectUrl(
  userRole: UserRole | null,
  approvalStatus: string | null,
  attemptedRoute: string
): string {
  // Pending approval members go to approval page
  if (needsApproval(approvalStatus, userRole)) {
    return '/pending-approval'
  }

  // Check if user can access route
  if (canAccessRoute(userRole, attemptedRoute)) {
    return attemptedRoute
  }

  // Redirect to default role route
  return getDefaultRoute(userRole)
}
