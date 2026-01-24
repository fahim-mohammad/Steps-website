'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

type UserRole = 'member' | 'manager' | 'owner'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  member_id?: string
  is_manager: boolean
  is_owner: boolean
  can_approve_members: boolean
}

interface AuthContextType {
  // Core auth state
  user: User | null
  session: Session | null
  loading: boolean
  
  // User profile & roles
  profile: UserProfile | null
  role: UserRole | null
  approvalStatus: 'pending' | 'approved' | 'rejected' | null
  
  // Role permissions
  isManager: boolean
  isOwner: boolean
  canApprovemembers: boolean
  
  // Auth methods
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  
  // Role switching
  switchRole: (newRole: UserRole) => Promise<void>
  assignRole: (userId: string, newRole: UserRole, adminId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
        setApprovalStatus(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  /**
   * Fetch complete user profile including role and member status
   */
  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user record from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Get member record if user is member/manager/owner
      let memberData = null
      const { data: memberRecord } = await supabase
        .from('members')
        .select('id, approval_status')
        .eq('user_id', userId)
        .single()

      memberData = memberRecord

      // Determine permissions based on role
      const isManager = userData.role === 'manager'
      const isOwner = userData.role === 'owner'
      const canApprovemembers = isOwner || isManager

      const userProfile: UserProfile = {
        id: userId,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role as UserRole,
        member_id: memberData?.id,
        is_manager: isManager,
        is_owner: isOwner,
        can_approve_members: canApprovemembers,
      }

      setProfile(userProfile)

      // Fetch approval status if member
      if (memberData?.approval_status) {
        setApprovalStatus(memberData.approval_status)
      } else {
        setApprovalStatus(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfile(null)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Create user profile (default role: member)
      if (data.user) {
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'member',
          },
        ])

        // Create member record with pending approval
        await supabase.from('members').insert([
          {
            user_id: data.user.id,
            full_name: fullName,
            email,
            approval_status: 'pending',
            status: 'active',
          },
        ])
      }

      return data
    } catch (error) {
      console.error('SignUp error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('SignIn error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
      setApprovalStatus(null)
    } catch (error) {
      console.error('SignOut error:', error)
      throw error
    }
  }

  /**
   * Switch current user's role (member ↔ manager/owner)
   * Does not change the account, only the active role
   */
  const switchRole = async (newRole: UserRole) => {
    if (!user || !profile) throw new Error('User not authenticated')

    // Validate role switch
    if (newRole === 'manager' && !profile.is_manager) {
      throw new Error('User does not have manager permissions')
    }
    if (newRole === 'owner' && !profile.is_owner) {
      throw new Error('User does not have owner permissions')
    }

    try {
      // Update current role in users table
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile
      await fetchUserProfile(user.id)
    } catch (error) {
      console.error('Error switching role:', error)
      throw error
    }
  }

  /**
   * Assign a role to another user (admin/owner only)
   */
  const assignRole = async (targetUserId: string, newRole: UserRole, adminId: string) => {
    try {
      // Verify admin has permission
      const { data: adminData } = await supabase
        .from('users')
        .select('role')
        .eq('id', adminId)
        .single()

      if (!adminData || (adminData.role !== 'owner' && adminData.role !== 'manager')) {
        throw new Error('Unauthorized: Only owners and managers can assign roles')
      }

      // Prevent non-owners from assigning owner role
      if (newRole === 'owner' && adminData.role !== 'owner') {
        throw new Error('Unauthorized: Only owners can assign owner role')
      }

      // Update target user's role
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', targetUserId)

      if (error) throw error
    } catch (error) {
      console.error('Error assigning role:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    profile,
    role: profile?.role ?? null,
    approvalStatus,
    isManager: profile?.is_manager ?? false,
    isOwner: profile?.is_owner ?? false,
    canApprovemembers: profile?.can_approve_members ?? false,
    signUp,
    signIn,
    signOut,
    switchRole,
    assignRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

