"use client";

import { useEffect, useState } from "react";
import { cloudApi, CloudSession } from "@/lib/cloudApi";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CloudSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    cloudApi.currentSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
    const unsubscribe = cloudApi.onAuthStateChange((s) => setSession(s));
    return unsubscribe;
  }, []);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const s = await cloudApi.signIn(email, password);
        setSession(s);
      } else {
        const s = await cloudApi.signUp(email, password);
        if (s) setSession(s);
        else setCheckEmail(true); // email confirmation required
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-canvas, #0f1419)",
          color: "var(--text-primary, #e6edf3)",
        }}
      >
        <div style={{ width: 320 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>AetherPM</h1>
          <p style={{ fontSize: 12, color: "var(--text-tertiary, #5b6672)", marginBottom: 20 }}>
            Sign in to your workspace.
          </p>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <button
              onClick={() => setMode("signin")}
              style={{ fontSize: 12, fontWeight: mode === "signin" ? 700 : 400, color: mode === "signin" ? "var(--text-primary, #e6edf3)" : "var(--text-tertiary, #5b6672)" }}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              style={{ fontSize: 12, fontWeight: mode === "signup" ? 700 : 400, color: mode === "signup" ? "var(--text-primary, #e6edf3)" : "var(--text-tertiary, #5b6672)" }}
            >
              Create account
            </button>
          </div>
          {checkEmail ? (
            <p style={{ fontSize: 12, color: "var(--text-secondary, #8b98a5)" }}>
              Check your email to confirm your account, then sign in.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "8px 10px", fontSize: 13 }} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "8px 10px", fontSize: 13 }} />
              {error && <div style={{ fontSize: 11, color: "#f87171" }}>{error}</div>}
              <button
                onClick={submit}
                disabled={busy || !email || !password}
                style={{ padding: "9px 12px", background: "#22d3ee", color: "#08131a", borderRadius: 6, fontSize: 13, fontWeight: 600 }}
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
