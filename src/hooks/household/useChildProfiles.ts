
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ChildProfile, CreateChildProfileData, UpdateChildProfileData } from '@/types/child-profiles';

export function useChildProfiles() {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { household, user } = useAuth();

  const fetchChildProfiles = async () => {
    if (!household) {
      setChildProfiles([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('household_id', household.id)
        .order('name');

      if (error) throw error;

      setChildProfiles(data || []);
    } catch (err: any) {
      console.error('Error fetching child profiles:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createChildProfile = async (data: CreateChildProfileData): Promise<ChildProfile | null> => {
    if (!household) {
      throw new Error('No household found');
    }

    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: newProfile, error } = await supabase
        .from('child_profiles')
        .insert({
          household_id: household.id,
          name: data.name,
          age: data.age || null,
          avatar_url: data.avatar_url || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setChildProfiles(prev => [...prev, newProfile]);
      
      toast({
        title: "Child profile created",
        description: `${data.name}'s profile has been added to your household.`
      });

      return newProfile;
    } catch (error: any) {
      console.error('Error creating child profile:', error);
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateChildProfile = async (id: string, data: UpdateChildProfileData): Promise<void> => {
    try {
      const { error } = await supabase
        .from('child_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setChildProfiles(prev => 
        prev.map(profile => 
          profile.id === id 
            ? { ...profile, ...data, updated_at: new Date().toISOString() }
            : profile
        )
      );

      toast({
        title: "Profile updated",
        description: "Child profile has been updated successfully."
      });
    } catch (error: any) {
      console.error('Error updating child profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteChildProfile = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('child_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChildProfiles(prev => prev.filter(profile => profile.id !== id));

      toast({
        title: "Profile deleted",
        description: "Child profile has been removed from your household."
      });
    } catch (error: any) {
      console.error('Error deleting child profile:', error);
      toast({
        title: "Error deleting profile",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchChildProfiles();
  }, [household]);

  return {
    childProfiles,
    isLoading,
    error,
    createChildProfile,
    updateChildProfile,
    deleteChildProfile,
    refreshChildProfiles: fetchChildProfiles
  };
}
