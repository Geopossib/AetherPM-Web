import { ChevronDown, Search, Command, Plus, Menu } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { NotificationBell } from "@/components/NotificationBell";

export function TopBar({ onNewProject }: { onNewProject?: () => void }) {
  const projects = useAppStore((s) => s.projects);
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const current = projects.find((p) => p.id === currentProjectId);

  return (
    <header
      className="topbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--space-4)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-canvas)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
        <button
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="mobile-menu-btn"
          style={{ alignItems: "center", color: "var(--text-secondary)", padding: 4, flexShrink: 0 }}
        >
          <Menu size={18} />
        </button>
        <div style={{ position: "relative", minWidth: 0 }}>
        <select
          value={currentProjectId ?? ""}
          onChange={(e) => setCurrentProject(e.target.value || null)}
          style={{
            appearance: "none",
            background: "transparent",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            paddingRight: 20,
          }}
        >
          <option value="" disabled>
            Select a project…
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} style={{ position: "absolute", right: 0, top: 4, pointerEvents: "none", color: "var(--text-tertiary)" }} />
        {current && (
          <span className="hide-mobile" style={{ marginLeft: 8, fontSize: 11, color: "var(--text-tertiary)" }}>{current.project_type}</span>
        )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {onNewProject && (
        <button
          onClick={onNewProject}
          title="New project"
          style={{ display: "flex", alignItems: "center", color: "var(--text-tertiary)", padding: 4 }}
        >
          <Plus size={16} />
        </button>
      )}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-secondary)",
          background: "var(--bg-surface)",
        }}
      >
        <Search size={14} />
        <span className="hide-mobile">Search or jump to…</span>
        <span
          className="mono hide-mobile"
          style={{
            marginLeft: 12,
            fontSize: 11,
            color: "var(--text-tertiary)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Command size={11} />K
        </span>
      </button>
      <NotificationBell />
      </div>
    </header>
  );
}
