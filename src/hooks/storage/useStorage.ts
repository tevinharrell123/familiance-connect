
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (
    bucketName: string,
    filePath: string,
    file: File
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      console.error(`Error uploading file to ${bucketName}:`, err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPublicUrl = (bucketName: string, filePath: string) => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    uploadFile,
    getPublicUrl,
    isLoading,
    error
  };
}
