import { supabase } from "./supabase";

export interface CloudSession {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export interface StorageUsage {
  used_bytes: number;
}

function toSession(session: { access_token: string; refresh_token: string; user: { id: string; email?: string } } | null): CloudSession | null {
  if (!session) return null;
  return { access_token: session.access_token, refresh_token: session.refresh_token, user_id: session.user.id, email: session.user.email ?? "" };
}

export const cloudApi = {
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return toSession(data.session);
  },
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return toSession(data.session);
  },
  signOut: async () => {
    await supabase.auth.signOut();
  },
  currentSession: async () => {
    const { data } = await supabase.auth.getSession();
    return toSession(data.session);
  },
  onAuthStateChange: (cb: (session: CloudSession | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(toSession(session)));
    return () => data.subscription.unsubscribe();
  },

  // Sum of attachment sizes across the workspace — real (based on
  // what's actually been uploaded), scoped to what Phase-1 RLS
  // exposes (see supabase/schema.sql), not a hard-enforced per-user
  // quota yet.
  storageUsage: async (): Promise<StorageUsage> => {
    const { data, error } = await supabase.from("attachments").select("size_bytes");
    if (error) throw error;
    const used_bytes = (data ?? []).reduce((sum: number, r: any) => sum + (r.size_bytes ?? 0), 0);
    return { used_bytes };
  },
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
