// lib/role-checks.ts
// Client-side role authorization checks
// Never expose sensitive data based on these checks alone

import React from 'react';

export type UserRole = 'member' | 'manager' | 'owner';

export interface UserPermissions {
  canViewDashboard: boolean;
  canSubmitDeposit: boolean;
  canViewDeposits: boolean;
  canApproveDeposits: boolean;
  canViewLoans: boolean;
  canApplyForLoan: boolean;
  canApproveLoan: boolean;
  canViewReports: boolean;
  canGenerateReports: boolean;
  canViewProfitDistribution: boolean;
  canDistributeProfit: boolean;
  canManageAccountant: boolean;
  canViewMembers: boolean;
  canViewSettings: boolean;
  canViewNotifications: boolean;
}

/**
 * Get user permissions based on role
 * Used for UI rendering only - always verify on server
 */
export function getUserPermissions(role: UserRole | undefined): UserPermissions {
  const basePermissions: UserPermissions = {
    canViewDashboard: false,
    canSubmitDeposit: false,
    canViewDeposits: false,
    canApproveDeposits: false,
    canViewLoans: false,
    canApplyForLoan: false,
    canApproveLoan: false,
    canViewReports: false,
    canGenerateReports: false,
    canViewProfitDistribution: false,
    canDistributeProfit: false,
    canManageAccountant: false,
    canViewMembers: false,
    canViewSettings: false,
    canViewNotifications: false,
  };

  if (!role) return basePermissions;

  switch (role) {
    case 'member':
      return {
        ...basePermissions,
        canViewDashboard: true,
        canSubmitDeposit: true,
        canViewDeposits: true,
        canApplyForLoan: true,
        canViewLoans: true,
        canViewProfitDistribution: true,
        canViewMembers: true,
        canViewSettings: true,
        canViewNotifications: true,
      };

    case 'manager':
      return {
        ...basePermissions,
        canViewDashboard: true,
        canSubmitDeposit: true,
        canViewDeposits: true,
        canApproveDeposits: true,
        canViewLoans: true,
        canApplyForLoan: true,
        canApproveLoan: true,
        canViewReports: true,
        canViewProfitDistribution: true,
        canDistributeProfit: true,
        canViewMembers: true,
        canViewSettings: true,
        canViewNotifications: true,
      };

    case 'owner':
      return {
        ...basePermissions,
        canViewDashboard: true,
        canSubmitDeposit: true,
        canViewDeposits: true,
        canApproveDeposits: true,
        canViewLoans: true,
        canApplyForLoan: true,
        canApproveLoan: true,
        canViewReports: true,
        canGenerateReports: true,
        canViewProfitDistribution: true,
        canDistributeProfit: true,
        canManageAccountant: true,
        canViewMembers: true,
        canViewSettings: true,
        canViewNotifications: true,
      };

    default:
      return basePermissions;
  }
}

/**
 * Check if user can perform action
 */
export function canUserAccess(role: UserRole | undefined, resource: keyof UserPermissions): boolean {
  const permissions = getUserPermissions(role);
  return permissions[resource];
}

/**
 * Get navigation items based on role
 */
export function getNavigationItems(role: UserRole | undefined) {
  const permissions = getUserPermissions(role);

  const items = [];

  if (permissions.canViewDashboard) {
    items.push({ label: 'Dashboard', href: `/${role}/dashboard`, icon: '📊' });
  }

  if (permissions.canSubmitDeposit) {
    items.push({ label: 'Submit Deposit', href: '/member/contributions/submit', icon: '💰' });
  }

  if (permissions.canViewDeposits) {
    if (permissions.canApproveDeposits) {
      items.push({ label: 'Approve Deposits', href: '/admin/approve-deposits', icon: '✅' });
    } else {
      items.push({ label: 'My Deposits', href: '/member/contributions', icon: '📝' });
    }
  }

  if (permissions.canApplyForLoan) {
    if (permissions.canApproveLoan) {
      items.push({ label: 'Loan Requests', href: '/admin/loans', icon: '📋' });
    } else {
      items.push({ label: 'Loan Application', href: '/member/loans/apply', icon: '📝' });
    }
  }

  if (permissions.canViewMembers) {
    items.push({ label: 'Members', href: '/members', icon: '👥' });
  }

  if (permissions.canViewReports) {
    items.push({ label: 'Reports', href: '/admin/reports', icon: '📈' });
  }

  if (permissions.canViewProfitDistribution) {
    if (permissions.canDistributeProfit) {
      items.push({ label: 'Profit Distribution', href: '/admin/profit-distribution', icon: '🎁' });
    } else {
      items.push({ label: 'Profit History', href: '/member/profit-history', icon: '🎁' });
    }
  }

  if (permissions.canManageAccountant) {
    items.push({ label: 'Accountant', href: '/admin/accountant', icon: '👨‍💼' });
  }

  if (permissions.canViewSettings) {
    items.push({ label: 'Settings', href: '/settings', icon: '⚙️' });
  }

  return items;
}

/**
 * Component wrapper to check authorization
 * Used in React components
 */
export const withRoleCheck = (Component: React.ComponentType<any>, requiredRole: UserRole | UserRole[]) => {
  return (props: any) => {
    const { role } = props;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(role)) {
      return null;
    }

    return React.createElement(Component, props);
  };
};
