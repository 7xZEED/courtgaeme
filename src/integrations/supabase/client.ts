import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vjzwmfkhhdsjoispugbb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqendtZmtoaGRzam9qc3B1Z2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDg0MzgsImV4cCI6MjA5ODEyNDQzOH0.O5rTQz1wvlKr-eExTDn0JmDWwc5qU1Lf-nCqBQfq9og";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
