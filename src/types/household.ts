
export type HouseholdRole = 'admin' | 'adult' | 'child' | 'guest';

export interface Household {
  id: string;
  name: string;
  created_at: string;
  invite_code: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  created_at: string;
  full_name: string;
  avatar_url?: string;
}

export interface HouseholdInvite {
  id: string;
  household_id: string;
  invite_code: string;
  created_at: string;
  expires_at: string;
}
