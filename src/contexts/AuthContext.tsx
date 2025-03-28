
import React, { createContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthProvider } from '@/hooks/auth/useAuthProvider';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name?: string, dob?: string }, profileImage?: File) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<any>; 
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthProvider();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Re-export useAuth from the hooks directory for convenience
export { useAuth } from '@/hooks/auth/useAuth';
