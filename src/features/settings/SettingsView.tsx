import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Plus, Trash2, Download, Upload } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { api, ProjectMember, Role } from "@/lib/api";
import { CloudPanel } from "./CloudPanel";

const ROLES: Role[] = ["Owner", "Admin", "Editor", "Viewer"];

const SHORTCUTS: [string, string][] = [
  ["Command palette", "Ctrl / Cmd + K"],
  ["Toggle sidebar", "Click the sidebar icon"],
  ["Close a panel / modal", "Esc"],
];

export function SettingsView() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const exportProject = async () => {
    if (!currentProjectId || !currentProject) return;
    setExporting(true);
    try {
      const json = await api.exportProject(currentProjectId);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentProject.name.replace(/[^a-z0-9-_]+/gi, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const importProject = () => fileInputRef.current?.click();

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-choosing the same file later
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const imported = await api.importProject(text);
      const updated = await api.listProjects();
      setProjects(updated);
      setCurrentProject(imported.id);
    } finally {
      setImporting(false);
    }
  };

  const refresh = () => {
    if (currentProjectId) api.listMembers(currentProjectId).then(setMembers).catch(console.error);
  };
  useEffect(refresh, [currentProjectId]);

  const addMember = async () => {
    if (!currentProjectId) return;
    const name = window.prompt("Member's name");
    if (!name) return;
    await api.addMember(currentProjectId, name, "Editor");
    refresh();
  };

  const changeRole = async (memberId: string, role: Role) => {
    await api.updateMemberRole(memberId, role);
    refresh();
  };

  const removeMember = async (memberId: string) => {
    await api.removeMember(memberId);
    refresh();
  };

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 560 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: "var(--space-5)" }}>Settings</h1>

      <CloudPanel />

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Appearance</h2>
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
          }}
        >
          {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
          {theme === "dark" ? "Dark" : "Light"} theme — click to switch
        </button>
      </section>

      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Members & roles</h2>
          <button
            onClick={addMember}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 9px", background: "var(--accent-dim)", color: "var(--accent-text)", borderRadius: "var(--radius-sm)", fontSize: 11 }}
          >
            <Plus size={12} /> Add member
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 10 }}>
          Adding a member lets you assign tasks and set a role. A member becomes an actual signed-in
          collaborator once their account is linked to this entry (full invite-by-email flow is a next step —
          see the README).
        </p>
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
          {!currentProjectId && <div style={{ padding: 12, fontSize: 12, color: "var(--text-tertiary)" }}>Select a project to manage its members.</div>}
          {currentProjectId && members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 13 }}>{m.display_name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  value={m.role}
                  onChange={(e) => changeRole(m.id, e.target.value as Role)}
                  disabled={m.role === "Owner"}
                  style={{ fontSize: 12 }}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {m.role !== "Owner" && (
                  <button onClick={() => removeMember(m.id)} style={{ color: "var(--status-danger)" }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && currentProjectId && <div style={{ padding: 12, fontSize: 12, color: "var(--text-tertiary)" }}>No members yet.</div>}
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Keyboard shortcuts</h2>
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
          {SHORTCUTS.map(([label, keys]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)", fontSize: 12 }}>
              <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              <span className="mono" style={{ color: "var(--text-tertiary)" }}>{keys}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Backup & sharing</h2>
        <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 10 }}>
          Export the current project to a JSON file to back it up or hand it to a teammate; import a file someone
          sent you as a new local project.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={exportProject}
            disabled={!currentProjectId || exporting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 13 }}
          >
            <Download size={14} /> {exporting ? "Exporting…" : "Export current project"}
          </button>
          <button
            onClick={importProject}
            disabled={importing}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", fontSize: 13 }}
          >
            <Upload size={14} /> {importing ? "Importing…" : "Import a project"}
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChosen} style={{ display: "none" }} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Data location</h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Project data is stored in your Supabase project's Postgres database, accessible from any device you
          sign in on.
        </p>
      </section>
    </div>
  );
}
