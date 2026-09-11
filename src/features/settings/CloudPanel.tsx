import { useEffect, useState } from "react";
import { Cloud, LogOut } from "lucide-react";
import { cloudApi, CloudSession, StorageUsage, formatBytes } from "@/lib/cloudApi";

export function CloudPanel() {
  const [session, setSession] = useState<CloudSession | null>(null);
  const [usage, setUsage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    cloudApi.currentSession().then((s) => {
      setSession(s);
      if (s) cloudApi.storageUsage().then(setUsage).catch(console.error);
    });
  }, []);

  const signOut = async () => {
    await cloudApi.signOut();
  };

  if (!session) return null;

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Cloud size={15} /> Account
        </h2>
        <button onClick={signOut} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-tertiary)" }}>
          <LogOut size={12} /> Sign out
        </button>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>{session.email}</div>
      {usage && (
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
          Attachments stored: {formatBytes(usage.used_bytes)}
        </div>
      )}
      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 10 }}>
        Phase 1: every signed-in account shares one workspace (see supabase/schema.sql). Per-account private
        workspaces and project-level sharing are a planned next step, not built yet.
      </p>
    </section>
  );
}
