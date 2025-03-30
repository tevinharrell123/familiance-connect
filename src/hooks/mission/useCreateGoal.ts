
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { FamilyGoal } from '@/types/goals';

interface CreateGoalParams {
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  assignedTo?: string;
  imageFile?: File | null;
  householdId: string;
}

export function useCreateGoal() {
  const [isLoading, setIsLoading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `goal-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('goals')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('goals').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const createGoal = async ({
    title,
    description,
    category,
    targetDate,
    assignedTo,
    imageFile,
    householdId
  }: CreateGoalParams): Promise<FamilyGoal> => {
    try {
      setIsLoading(true);

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Convert "unassigned" to null for the database
      const actualAssignedTo = assignedTo === "unassigned" ? null : assignedTo;

      const goalData = {
        household_id: householdId,
        title,
        description,
        category,
        target_date: targetDate || null,
        assigned_to: actualAssignedTo || null,
        image_url: imageUrl
      };

      const { data, error } = await supabase
        .from('family_goals')
        .insert(goalData)
        .select('*')
        .single();

      if (error) throw error;

      return data as FamilyGoal;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createGoal,
    isLoading
  };
}
