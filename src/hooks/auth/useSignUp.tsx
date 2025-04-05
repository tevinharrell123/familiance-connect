
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { generateInviteCode } from '@/lib/utils';

export function useSignUp(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: ReturnType<typeof useNavigate>
) {
  const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatar/${fileName}`;

      console.log('Uploading profile image:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading profile image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('Profile image uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { 
      full_name?: string, 
      birthday?: string, 
      household_name?: string, 
      household_code?: string 
    }, 
    profileImage?: File | null
  ) => {
    try {
      setIsLoading(true);
      console.log('Starting sign up process with data:', { ...userData, email });
      
      // Make sure we're storing household details in user metadata
      const userMetadata = {
        full_name: userData.full_name,
        birthday: userData.birthday,
        household_name: userData.household_name || null,
        household_code: userData.household_code || null
      };
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (profileImage && data.user) {
        console.log('Uploading profile image for user:', data.user.id);
        const avatarUrl = await uploadProfileImage(data.user.id, profileImage);
        
        if (avatarUrl) {
          console.log('Updating profile with avatar URL:', avatarUrl);
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', data.user.id);
            
          if (profileError) {
            console.error('Error updating profile with avatar:', profileError);
          }
        }
      }

      let successMessage;
      if (userData.household_name) {
        successMessage = "Your account and household have been created. Please check your email to confirm your account.";
      } else if (userData.household_code) {
        successMessage = "Your account has been created. You'll join the household after confirming your email.";
      } else {
        successMessage = "Your account has been created. Please check your email to confirm your account.";
      }
      
      toast({
        title: "Account created!",
        description: successMessage,
      });
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp };
}
