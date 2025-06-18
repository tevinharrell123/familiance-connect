
-- Add assigned_to_member column to household_events table
ALTER TABLE public.household_events 
ADD COLUMN assigned_to_member uuid;

-- Add assigned_to_member column to user_events table  
ALTER TABLE public.user_events 
ADD COLUMN assigned_to_member uuid;
