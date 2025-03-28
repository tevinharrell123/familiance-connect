
import { supabase } from '@/integrations/supabase/client';
import { Household, Member } from '@/types/household';

export async function fetchMembershipData(userId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('household_id, role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching membership:', error);
    throw error;
  }

  return data;
}

export async function fetchHouseholdData(householdId: string) {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching household:', error);
    throw error;
  }

  return data as Household | null;
}

export async function fetchHouseholdMembers(householdId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('id, user_id, household_id, role')
    .eq('household_id', householdId);

  if (error) {
    console.error('Error fetching memberships:', error);
    throw error;
  }

  return data;
}

export async function fetchUserProfiles(userIds: string[]) {
  if (!userIds.length) return [];
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name, avatar_url')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }

  return data;
}

export function combineProfilesWithMembers(members: any[], profiles: any[]): Member[] {
  // Create a map of user profiles for quick lookup
  const profilesMap = profiles.reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {} as Record<string, any>);
  
  // Combine membership data with profile data
  return members.map(membership => {
    const profile = profilesMap[membership.user_id] || {};
    return {
      id: membership.id,
      user_id: membership.user_id,
      household_id: membership.household_id,
      role: membership.role,
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar_url: profile.avatar_url
    };
  });
}
