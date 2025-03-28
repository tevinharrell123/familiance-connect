
export interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Member {
  id: string;
  user_id: string;
  household_id: string;
  role: 'admin' | 'adult' | 'child';
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface HouseholdContextType {
  household: Household | null;
  members: Member[];
  isLoading: boolean;
  isAdmin: boolean;
  inviteMember: (email: string, role: 'admin' | 'adult' | 'child') => Promise<void>;
  refreshHousehold: () => Promise<void>;
}
