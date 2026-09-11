// Supabase-backed replacement for the desktop app's Tauri invoke()
// layer. Every function keeps the exact same name/signature as the
// original src/lib/api.ts so every component that does
// `import { api } from "@/lib/api"` works completely unchanged.

import { supabase } from "./supabase";

export type ProjectType = "General" | "Software" | "SystemsEngineering" | "Research" | "Custom";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  created_at: string;
  archived: boolean;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "Backlog" | "Todo" | "InProgress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High" | "Critical";
  parent_task_id: string | null;
  estimate_hours: number | null;
  actual_hours: number | null;
  due_date: string | null;
  start_date: string | null;
  assignee_name: string | null;
  sprint_id: string | null;
  tags: string | null;
  created_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: "Planned" | "Active" | "Completed";
  created_at: string;
}

export interface SavedView {
  id: string;
  project_id: string;
  name: string;
  view_type: string;
  filter_json: string;
}

export interface ActivityEvent {
  id: string;
  project_id: string;
  actor_name: string;
  entity_type: string;
  entity_id: string;
  action: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  project_id: string;
  entity_type: string;
  entity_id: string;
  file_path: string; // Supabase Storage object path (bucket: "attachments")
  file_name: string;
  added_at: string;
}

export type TaskLinkType = "blocks" | "relates_to" | "duplicates";
export interface TaskLink {
  id: string;
  project_id: string;
  from_task_id: string;
  to_task_id: string;
  link_type: TaskLinkType;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  status: "Planned" | "AtRisk" | "Achieved" | "Missed";
  created_at: string;
}

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export interface Risk {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  likelihood: RiskLevel;
  impact: RiskLevel;
  status: "Open" | "Mitigating" | "Closed" | "Accepted";
  owner_name: string | null;
  created_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  title: string;
  decision: string;
  rationale: string | null;
  status: "Proposed" | "Decided" | "Reversed";
  decided_at: string | null;
  created_at: string;
}

export interface MeetingNote {
  id: string;
  project_id: string;
  title: string;
  meeting_date: string;
  attendees: string | null;
  notes: string;
  created_at: string;
}

export interface Baseline {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export interface BaselineComparison {
  baseline: Baseline;
  tasks_added_since: number;
  tasks_completed_since: number;
  tasks_overdue_now: number;
}

export type SysmlElementType = "block" | "port" | "actor" | "use_case" | "activity" | "requirement_ref";
export interface SysmlElement {
  id: string;
  project_id: string;
  element_type: SysmlElementType;
  name: string;
  package: string | null;
  properties: string | null;
}

export type DiagramType = "Requirements" | "BDD" | "IBD" | "UseCase" | "Activity";
export interface Diagram {
  id: string;
  project_id: string;
  name: string;
  diagram_type: DiagramType;
}

export interface DiagramNode {
  id: string;
  diagram_id: string;
  element_id: string | null;
  label: string;
  pos_x: number;
  pos_y: number;
}

export interface DiagramEdge {
  id: string;
  diagram_id: string;
  source_node_id: string;
  target_node_id: string;
  label: string | null;
}

export interface DiagramDetail {
  diagram: Diagram;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DiagramNodeInput {
  element_id: string | null;
  label: string;
  pos_x: number;
  pos_y: number;
  client_id: string;
}

export interface DiagramEdgeInput {
  source_client_id: string;
  target_client_id: string;
  label: string | null;
}

export interface ValidationIssue {
  rule: string;
  severity: "info" | "warning" | "error";
  message: string;
  entity_type: string;
  entity_id: string;
}

export type Role = "Owner" | "Admin" | "Editor" | "Viewer";
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string | null;
  display_name: string;
  role: Role;
}

export interface Comment {
  id: string;
  project_id: string;
  entity_type: string;
  entity_id: string;
  author_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  project_id: string | null;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Requirement {
  id: string;
  project_id: string;
  req_key: string;
  statement: string;
  req_type: "Functional" | "Performance" | "Interface" | "Constraint" | "Stakeholder";
  status: "Draft" | "Reviewed" | "Approved" | "Verified" | "Rejected";
  priority: "Low" | "Medium" | "High" | "Critical";
  verification_method: "Inspection" | "Analysis" | "Demonstration" | "Test" | "None";
  parent_requirement_id: string | null;
  created_at: string;
}

export interface TraceLink {
  id: string;
  project_id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relation: string;
}

export interface SearchResult {
  entity_type: string;
  entity_id: string;
  project_id: string;
  title: string;
  snippet: string;
}

// ---------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------

function bail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function listByProject<T>(table: string, projectId: string, orderCol = "created_at"): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").eq("project_id", projectId).order(orderCol);
  bail(error);
  return (data ?? []) as T[];
}

async function upsertRow<T>(table: string, row: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.from(table).upsert(row).select().single();
  bail(error);
  return data as T;
}

async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  bail(error);
}

async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export const api = {
  // Projects
  createProject: (name: string, description: string | null, projectType: ProjectType) =>
    upsertRow<Project>("projects", { name, description, project_type: projectType }),
  listProjects: async (includeArchived = false) => {
    let q = supabase.from("projects").select("*").order("created_at");
    if (!includeArchived) q = q.eq("archived", false);
    const { data, error } = await q;
    bail(error);
    return (data ?? []) as Project[];
  },
  archiveProject: async (projectId: string) => {
    const { error } = await supabase.from("projects").update({ archived: true }).eq("id", projectId);
    bail(error);
  },

  // Tasks
  saveTask: (task: Partial<Task> & { project_id: string; title: string }) => upsertRow<Task>("tasks", task),
  listTasks: (projectId: string) => listByProject<Task>("tasks", projectId),
  deleteTask: (taskId: string) => deleteRow("tasks", taskId),

  // Requirements
  saveRequirement: async (req: Partial<Requirement> & { project_id: string; statement: string }) => {
    if (req.id) return upsertRow<Requirement>("requirements", req);
    const { count } = await supabase
      .from("requirements")
      .select("id", { count: "exact", head: true })
      .eq("project_id", req.project_id);
    const req_key = `REQ-${String((count ?? 0) + 1).padStart(3, "0")}`;
    return upsertRow<Requirement>("requirements", {
      req_type: "Functional",
      status: "Draft",
      priority: "Medium",
      verification_method: "None",
      ...req,
      req_key,
    });
  },
  listRequirements: (projectId: string) => listByProject<Requirement>("requirements", projectId, "req_key"),

  // Traceability
  createTraceLink: (link: Omit<TraceLink, "id">) => upsertRow<TraceLink>("trace_links", link),
  listTraceLinks: (projectId: string) => listByProject<TraceLink>("trace_links", projectId, "id"),
  findOrphanRequirements: async (projectId: string) => {
    const [{ data: reqs, error: e1 }, { data: links, error: e2 }] = await Promise.all([
      supabase.from("requirements").select("*").eq("project_id", projectId),
      supabase.from("trace_links").select("source_type,source_id,target_type,target_id").eq("project_id", projectId),
    ]);
    bail(e1); bail(e2);
    const linked = new Set<string>();
    (links ?? []).forEach((l: any) => {
      if (l.source_type === "requirement") linked.add(l.source_id);
      if (l.target_type === "requirement") linked.add(l.target_id);
    });
    return ((reqs ?? []) as Requirement[]).filter((r) => !linked.has(r.id));
  },

  // Search — simple client-side full-text-ish match across a few tables
  searchAll: async (projectId: string, query: string): Promise<SearchResult[]> => {
    const q = query.trim();
    if (!q) return [];
    const like = `%${q}%`;
    const [tasks, reqs] = await Promise.all([
      supabase.from("tasks").select("id,project_id,title").eq("project_id", projectId).ilike("title", like),
      supabase
        .from("requirements")
        .select("id,project_id,req_key,statement")
        .eq("project_id", projectId)
        .ilike("statement", like),
    ]);
    const results: SearchResult[] = [];
    (tasks.data ?? []).forEach((t: any) =>
      results.push({ entity_type: "task", entity_id: t.id, project_id: t.project_id, title: t.title, snippet: "" })
    );
    (reqs.data ?? []).forEach((r: any) =>
      results.push({
        entity_type: "requirement",
        entity_id: r.id,
        project_id: r.project_id,
        title: r.req_key,
        snippet: r.statement.slice(0, 120),
      })
    );
    return results;
  },

  // Import / export — browser-native, no filesystem paths on the web.
  // exportProject returns JSON text for the caller to download;
  // importProject takes the raw text of a chosen file.
  exportProject: async (projectId: string): Promise<string> => {
    const [project, tasks, requirements, trace_links] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase.from("tasks").select("*").eq("project_id", projectId),
      supabase.from("requirements").select("*").eq("project_id", projectId),
      supabase.from("trace_links").select("*").eq("project_id", projectId),
    ]);
    bail(project.error);
    return JSON.stringify(
      { project: project.data, tasks: tasks.data ?? [], requirements: requirements.data ?? [], trace_links: trace_links.data ?? [] },
      null,
      2
    );
  },
  importProject: async (fileContents: string): Promise<Project> => {
    const pkg = JSON.parse(fileContents);
    const project = await upsertRow<Project>("projects", {
      name: pkg.project.name,
      description: pkg.project.description,
      project_type: pkg.project.project_type,
    });
    for (const t of pkg.tasks ?? []) {
      await upsertRow<Task>("tasks", {
        project_id: project.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        estimate_hours: t.estimate_hours,
        actual_hours: t.actual_hours,
        due_date: t.due_date,
        start_date: t.start_date,
        assignee_name: t.assignee_name,
        tags: t.tags,
      });
    }
    for (const r of pkg.requirements ?? []) {
      await api.saveRequirement({
        project_id: project.id,
        statement: r.statement,
        req_type: r.req_type,
        status: r.status,
        priority: r.priority,
        verification_method: r.verification_method,
      });
    }
    return project;
  },

  // Milestones
  saveMilestone: (m: Partial<Milestone> & { project_id: string; name: string }) => upsertRow<Milestone>("milestones", m),
  listMilestones: (projectId: string) => listByProject<Milestone>("milestones", projectId),
  deleteMilestone: (milestoneId: string) => deleteRow("milestones", milestoneId),

  // Risks
  saveRisk: (r: Partial<Risk> & { project_id: string; title: string }) => upsertRow<Risk>("risks", r),
  listRisks: (projectId: string) => listByProject<Risk>("risks", projectId),

  // Decisions
  saveDecision: (d: Partial<Decision> & { project_id: string; title: string; decision: string }) =>
    upsertRow<Decision>("decisions", d),
  listDecisions: (projectId: string) => listByProject<Decision>("decisions", projectId),

  // Meeting notes
  saveMeetingNote: (n: Partial<MeetingNote> & { project_id: string; title: string; meeting_date: string }) =>
    upsertRow<MeetingNote>("meeting_notes", n),
  listMeetingNotes: (projectId: string) => listByProject<MeetingNote>("meeting_notes", projectId),

  // Baselines
  createBaseline: async (projectId: string, name: string) => {
    const { data: tasks } = await supabase.from("tasks").select("*").eq("project_id", projectId);
    return upsertRow<Baseline>("baselines", { project_id: projectId, name, snapshot_json: JSON.stringify(tasks ?? []) });
  },
  listBaselines: (projectId: string) => listByProject<Baseline>("baselines", projectId),
  compareBaseline: async (baselineId: string): Promise<BaselineComparison> => {
    const { data: baseline, error } = await supabase.from("baselines").select("*").eq("id", baselineId).single();
    bail(error);
    const snapshot: Task[] = JSON.parse(baseline!.snapshot_json);
    const snapshotIds = new Set(snapshot.map((t) => t.id));
    const { data: current } = await supabase.from("tasks").select("*").eq("project_id", baseline!.project_id);
    const currentTasks = (current ?? []) as Task[];
    const tasks_added_since = currentTasks.filter((t) => !snapshotIds.has(t.id)).length;
    const tasks_completed_since = currentTasks.filter(
      (t) => t.status === "Done" && snapshot.find((s) => s.id === t.id)?.status !== "Done"
    ).length;
    const today = new Date().toISOString().slice(0, 10);
    const tasks_overdue_now = currentTasks.filter((t) => t.due_date && t.due_date < today && t.status !== "Done").length;
    return { baseline: baseline as Baseline, tasks_added_since, tasks_completed_since, tasks_overdue_now };
  },

  // SysML elements
  saveSysmlElement: (e: Partial<SysmlElement> & { project_id: string; element_type: SysmlElementType; name: string }) =>
    upsertRow<SysmlElement>("sysml_elements", e),
  listSysmlElements: (projectId: string) => listByProject<SysmlElement>("sysml_elements", projectId, "name"),
  deleteSysmlElement: (elementId: string) => deleteRow("sysml_elements", elementId),

  // Diagrams
  createDiagram: (projectId: string, name: string, diagramType: DiagramType) =>
    upsertRow<Diagram>("diagrams", { project_id: projectId, name, diagram_type: diagramType }),
  listDiagrams: (projectId: string) => listByProject<Diagram>("diagrams", projectId, "name"),
  deleteDiagram: (diagramId: string) => deleteRow("diagrams", diagramId),
  getDiagramDetail: async (diagramId: string): Promise<DiagramDetail> => {
    const [diagram, nodes, edges] = await Promise.all([
      supabase.from("diagrams").select("*").eq("id", diagramId).single(),
      supabase.from("diagram_nodes").select("*").eq("diagram_id", diagramId),
      supabase.from("diagram_edges").select("*").eq("diagram_id", diagramId),
    ]);
    bail(diagram.error);
    return { diagram: diagram.data as Diagram, nodes: (nodes.data ?? []) as DiagramNode[], edges: (edges.data ?? []) as DiagramEdge[] };
  },
  saveDiagramLayout: async (diagramId: string, nodes: DiagramNodeInput[], edges: DiagramEdgeInput[]): Promise<DiagramDetail> => {
    await supabase.from("diagram_edges").delete().eq("diagram_id", diagramId);
    await supabase.from("diagram_nodes").delete().eq("diagram_id", diagramId);

    const clientIdToRealId = new Map<string, string>();
    for (const n of nodes) {
      const created = await upsertRow<DiagramNode>("diagram_nodes", {
        diagram_id: diagramId,
        element_id: n.element_id,
        label: n.label,
        pos_x: n.pos_x,
        pos_y: n.pos_y,
      });
      clientIdToRealId.set(n.client_id, created.id);
    }
    for (const e of edges) {
      const source = clientIdToRealId.get(e.source_client_id);
      const target = clientIdToRealId.get(e.target_client_id);
      if (!source || !target) continue;
      await upsertRow<DiagramEdge>("diagram_edges", { diagram_id: diagramId, source_node_id: source, target_node_id: target, label: e.label });
    }
    return api.getDiagramDetail(diagramId);
  },

  // Validation
  validateProject: async (projectId: string): Promise<ValidationIssue[]> => {
    const issues: ValidationIssue[] = [];
    const [reqsRes, linksRes, risksRes, blocksRes, nodesRes] = await Promise.all([
      supabase.from("requirements").select("id,req_key").eq("project_id", projectId),
      supabase.from("trace_links").select("source_type,source_id,target_type,target_id").eq("project_id", projectId),
      supabase.from("risks").select("id,title,status,impact,owner_name").eq("project_id", projectId),
      supabase.from("sysml_elements").select("id,name").eq("project_id", projectId).eq("element_type", "block"),
      supabase.from("diagram_nodes").select("element_id"),
    ]);
    const links = linksRes.data ?? [];
    const linked = new Set<string>();
    links.forEach((l: any) => {
      if (l.source_type === "requirement") linked.add(l.source_id);
      if (l.target_type === "requirement") linked.add(l.target_id);
    });
    (reqsRes.data ?? []).forEach((r: any) => {
      if (!linked.has(r.id)) {
        issues.push({ rule: "orphan_requirement", severity: "warning", entity_type: "requirement", entity_id: r.id, message: `${r.req_key} has no trace links — nothing satisfies it or is verified by it.` });
      }
    });
    (risksRes.data ?? []).forEach((r: any) => {
      if (r.status === "Open" && !r.owner_name) {
        issues.push({ rule: "uncovered_risk", severity: "warning", entity_type: "risk", entity_id: r.id, message: `Risk "${r.title}" is open with no owner.` });
      }
    });
    const riskTargets = new Set(links.filter((l: any) => l.target_type === "risk").map((l: any) => l.target_id));
    (risksRes.data ?? []).forEach((r: any) => {
      if (r.status === "Open" && (r.impact === "High" || r.impact === "Critical") && !riskTargets.has(r.id)) {
        issues.push({ rule: "unmitigated_high_risk", severity: "error", entity_type: "risk", entity_id: r.id, message: `High/critical risk "${r.title}" has no linked mitigation task.` });
      }
    });
    const modeledElementIds = new Set((nodesRes.data ?? []).map((n: any) => n.element_id).filter(Boolean));
    (blocksRes.data ?? []).forEach((b: any) => {
      if (!modeledElementIds.has(b.id)) {
        issues.push({ rule: "unmodeled_block", severity: "info", entity_type: "sysml_element", entity_id: b.id, message: `Block "${b.name}" doesn't appear in any diagram.` });
      }
    });
    return issues;
  },

  // Members / roles
  listMembers: (projectId: string) => listByProject<ProjectMember>("project_members", projectId, "id"),
  addMember: (projectId: string, displayName: string, role: Role) =>
    upsertRow<ProjectMember>("project_members", { project_id: projectId, display_name: displayName, role }),
  updateMemberRole: async (memberId: string, role: Role) => {
    const { error } = await supabase.from("project_members").update({ role }).eq("id", memberId);
    bail(error);
  },
  removeMember: (memberId: string) => deleteRow("project_members", memberId),

  // Comments
  saveComment: async (projectId: string, entityType: string, entityId: string, body: string) => {
    const user = await currentUser();
    return upsertRow<Comment>("comments", {
      project_id: projectId,
      entity_type: entityType,
      entity_id: entityId,
      author_id: user?.id ?? null,
      author_name: user?.email ?? "You",
      body,
    });
  },
  listComments: async (projectId: string, entityType: string, entityId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("project_id", projectId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at");
    bail(error);
    return (data ?? []) as Comment[];
  },

  // Notifications
  listNotifications: async () => {
    const user = await currentUser();
    if (!user) return [] as AppNotification[];
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    bail(error);
    return (data ?? []) as AppNotification[];
  },
  markNotificationRead: async (id: string) => {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    bail(error);
  },
  markAllNotificationsRead: async () => {
    const user = await currentUser();
    if (!user) return;
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
    bail(error);
  },

  // Sprints
  saveSprint: (s: Partial<Sprint> & { project_id: string; name: string }) => upsertRow<Sprint>("sprints", s),
  listSprints: (projectId: string) => listByProject<Sprint>("sprints", projectId),
  deleteSprint: (sprintId: string) => deleteRow("sprints", sprintId),

  // Saved views
  saveView: (projectId: string, name: string, viewType: string, filterJson: string) =>
    upsertRow<SavedView>("saved_views", { project_id: projectId, name, view_type: viewType, filter_json: filterJson }),
  listViews: async (projectId: string, viewType: string) => {
    const { data, error } = await supabase.from("saved_views").select("*").eq("project_id", projectId).eq("view_type", viewType);
    bail(error);
    return (data ?? []) as SavedView[];
  },
  deleteView: (viewId: string) => deleteRow("saved_views", viewId),

  // Activity
  listActivity: async (projectId: string, limit = 30) => {
    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(limit);
    bail(error);
    return (data ?? []) as ActivityEvent[];
  },

  // Attachments — filePath is a Supabase Storage object path (bucket
  // "attachments"); AttachmentsList.tsx uploads the file there first.
  addAttachment: (projectId: string, entityType: string, entityId: string, filePath: string, fileName: string, sizeBytes = 0) =>
    upsertRow<Attachment>("attachments", { project_id: projectId, entity_type: entityType, entity_id: entityId, file_path: filePath, file_name: fileName, size_bytes: sizeBytes }),
  listAttachments: async (projectId: string, entityType: string, entityId: string) => {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("project_id", projectId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("added_at");
    bail(error);
    return (data ?? []) as Attachment[];
  },
  deleteAttachment: async (attachmentId: string) => {
    const { data } = await supabase.from("attachments").select("file_path").eq("id", attachmentId).single();
    if (data?.file_path) await supabase.storage.from("attachments").remove([data.file_path]);
    await deleteRow("attachments", attachmentId);
  },

  // Task dependency links
  createTaskLink: (projectId: string, fromTaskId: string, toTaskId: string, linkType: TaskLinkType) =>
    upsertRow<TaskLink>("task_links", { project_id: projectId, from_task_id: fromTaskId, to_task_id: toTaskId, link_type: linkType }),
  listTaskLinks: (projectId: string) => listByProject<TaskLink>("task_links", projectId, "id"),
  deleteTaskLink: (linkId: string) => deleteRow("task_links", linkId),
};
