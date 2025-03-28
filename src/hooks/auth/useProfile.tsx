
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useProfile() {
  const [profile, setProfile] = useState<any | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async (userId: string | undefined) => {
    if (userId) {
      return await fetchProfile(userId);
    }
    return null;
  };

  return {
    profile,
    setProfile,
    fetchProfile,
    refreshProfile
  };
}
