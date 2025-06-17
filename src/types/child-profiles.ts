
export interface ChildProfile {
  id: string;
  household_id: string;
  name: string;
  age: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateChildProfileData {
  name: string;
  age?: number;
  avatar_url?: string;
}

export interface UpdateChildProfileData {
  name?: string;
  age?: number;
  avatar_url?: string;
}
