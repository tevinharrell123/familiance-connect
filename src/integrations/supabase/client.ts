// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ogsuheeqxfdoxwquczjr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc3VoZWVxeGZkb3h3cXVjempyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNDA0MDQsImV4cCI6MjA1ODcxNjQwNH0.VGuoLa-2WLxye1YGvb7HZm4MsdJlaUwmy4ENAEk8hw0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);