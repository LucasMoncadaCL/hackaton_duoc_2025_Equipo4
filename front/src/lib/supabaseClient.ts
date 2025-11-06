import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ensureEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const getSupabaseUrl = (): string => ensureEnv("NEXT_PUBLIC_SUPABASE_URL");
const getSupabaseAnonKey = (): string => ensureEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const getSupabaseServiceRoleKey = (): string => ensureEnv("SUPABASE_SERVICE_ROLE_KEY");

export const createSupabaseBrowserClient = (): SupabaseClient =>
  createClient(getSupabaseUrl(), getSupabaseAnonKey());

export const createSupabaseServerClient = (): SupabaseClient =>
  createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

export const createSupabaseServiceRoleClient = (): SupabaseClient =>
  createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

