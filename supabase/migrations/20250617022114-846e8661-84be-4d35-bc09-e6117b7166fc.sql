
-- Add child profiles table for non-authenticated household members
CREATE TABLE public.child_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS on child_profiles
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for child_profiles
CREATE POLICY "Household members can view child profiles" 
  ON public.child_profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = child_profiles.household_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household adults can create child profiles" 
  ON public.child_profiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = child_profiles.household_id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'adult')
    )
  );

CREATE POLICY "Household adults can update child profiles" 
  ON public.child_profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = child_profiles.household_id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'adult')
    )
  );

CREATE POLICY "Household adults can delete child profiles" 
  ON public.child_profiles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = child_profiles.household_id 
      AND user_id = auth.uid() 
      AND role IN ('admin', 'adult')
    )
  );

-- Update household_events table to allow assignment to child profiles
ALTER TABLE public.household_events 
ADD COLUMN assigned_to_child UUID REFERENCES public.child_profiles(id);

-- Update user_events table to allow assignment to child profiles  
ALTER TABLE public.user_events 
ADD COLUMN assigned_to_child UUID REFERENCES public.child_profiles(id);
