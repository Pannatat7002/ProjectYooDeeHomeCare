import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.CONFIG_NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.CONFIG_NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.CONFIG_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = () => {
    return Boolean(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey));
};

// Client for public / frontend usage (uses anon key)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// Admin client for backend API routes (uses service role key to bypass RLS)
export const supabaseAdmin = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceRoleKey || supabaseAnonKey || 'placeholder',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export const BUCKET_NAME = 'yoodee-images';
