
import React, { createContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthProvider } from '@/hooks/auth/useAuthProvider';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  household: Household | null;
  householdMembers: HouseholdMember[] | null;
  userRole: HouseholdRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name?: string, dob?: string }, profileImage?: File) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<any>;
  createHousehold: (name: string) => Promise<Household>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  getHouseholdMembers: () => Promise<HouseholdMember[]>;
  updateMemberRole: (memberId: string, role: HouseholdRole) => Promise<void>;
  leaveHousehold: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthProvider();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Re-export useAuth from the hooks directory for convenience
export { useAuth } from '@/hooks/auth/useAuth';
