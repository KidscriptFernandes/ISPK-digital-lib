import { supabase } from "@/integrations/supabase/client";

export interface ManagedUser {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "student";
  created_at: string;
  confirmed: boolean;
  last_sign_in_at: string | null;
  banned: boolean;
}

export async function adminCall<T = any>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  if (error) {
    let msg = error.message;
    try {
      const ctx = (error as any).context;
      if (ctx?.json) { const j = await ctx.json(); if (j?.error) msg = j.error; }
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}
