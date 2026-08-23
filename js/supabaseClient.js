import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://mgcflesgyqkfwyhgwwvp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nY2ZsZXNneXFrZnd5aGd3d3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NjE3NTgsImV4cCI6MjEwMzAzNzc1OH0.6M9jqIesmzU4c_mb7gukd0wIsSxWvP04FB8tNwwyw_s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
