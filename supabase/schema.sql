-- AetherPM Web — Supabase schema
-- Consolidated from the desktop app's SQLite migrations (0001-0005),
-- translated to Postgres. Run this once in your Supabase project's
-- SQL editor (Database > SQL Editor > New query) before deploying.

create extension if not exists "pgcrypto";

create table if not exists projects (
    id            uuid primary key default gen_random_uuid(),
    name          text not null,
    description   text,
    project_type  text not null default 'General',
    archived      boolean not null default false,
    created_at    timestamptz not null default now()
);

create table if not exists project_members (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    user_id       uuid references auth.users(id) on delete set null, -- null until the invitee actually signs up
    display_name  text not null,
    role          text not null default 'Editor' -- Owner | Admin | Editor | Viewer
);

create table if not exists tasks (
    id              uuid primary key default gen_random_uuid(),
    project_id      uuid not null references projects(id) on delete cascade,
    title           text not null,
    description     text,
    status          text not null default 'Todo',
    priority        text not null default 'Medium',
    parent_task_id  uuid references tasks(id) on delete set null,
    estimate_hours  double precision,
    actual_hours    double precision,
    due_date        text,
    start_date      text,
    assignee_name   text,
    sprint_id       uuid,
    tags            text,
    created_at      timestamptz not null default now()
);

create table if not exists task_links (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    from_task_id  uuid not null references tasks(id) on delete cascade,
    to_task_id    uuid not null references tasks(id) on delete cascade,
    link_type     text not null default 'blocks' -- blocks | relates_to | duplicates
);

create table if not exists milestones (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    name          text not null,
    description   text,
    due_date      text,
    status        text not null default 'Planned',
    created_at    timestamptz not null default now()
);

create table if not exists requirements (
    id                      uuid primary key default gen_random_uuid(),
    project_id              uuid not null references projects(id) on delete cascade,
    req_key                 text not null,
    statement               text not null,
    req_type                text not null default 'Functional',
    status                  text not null default 'Draft',
    priority                text not null default 'Medium',
    verification_method     text not null default 'None',
    parent_requirement_id   uuid references requirements(id) on delete set null,
    created_at              timestamptz not null default now(),
    unique(project_id, req_key)
);

create table if not exists sysml_elements (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    element_type  text not null,
    name          text not null,
    package       text,
    properties    text
);

create table if not exists diagrams (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    name          text not null,
    diagram_type  text not null
);

create table if not exists diagram_nodes (
    id            uuid primary key default gen_random_uuid(),
    diagram_id    uuid not null references diagrams(id) on delete cascade,
    element_id    uuid references sysml_elements(id) on delete set null,
    label         text not null,
    pos_x         double precision not null default 0,
    pos_y         double precision not null default 0
);

create table if not exists diagram_edges (
    id              uuid primary key default gen_random_uuid(),
    diagram_id      uuid not null references diagrams(id) on delete cascade,
    source_node_id  uuid not null references diagram_nodes(id) on delete cascade,
    target_node_id  uuid not null references diagram_nodes(id) on delete cascade,
    label           text
);

create table if not exists trace_links (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    source_type   text not null,
    source_id     uuid not null,
    target_type   text not null,
    target_id     uuid not null,
    relation      text not null default 'satisfies'
);

create table if not exists risks (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    title         text not null,
    description   text,
    likelihood    text not null default 'Medium',
    impact        text not null default 'Medium',
    status        text not null default 'Open',
    owner_name    text,
    created_at    timestamptz not null default now()
);

create table if not exists decisions (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    title         text not null,
    decision      text not null,
    rationale     text,
    status        text not null default 'Decided',
    decided_at    text,
    created_at    timestamptz not null default now()
);

create table if not exists meeting_notes (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    title         text not null,
    meeting_date  text not null,
    attendees     text,
    notes         text not null default '',
    created_at    timestamptz not null default now()
);

create table if not exists baselines (
    id              uuid primary key default gen_random_uuid(),
    project_id      uuid not null references projects(id) on delete cascade,
    name            text not null,
    snapshot_json   text not null,
    created_at      timestamptz not null default now()
);

create table if not exists sprints (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    name          text not null,
    start_date    text,
    end_date      text,
    status        text not null default 'Planned',
    created_at    timestamptz not null default now()
);

alter table tasks add constraint tasks_sprint_id_fkey
    foreign key (sprint_id) references sprints(id) on delete set null;

create table if not exists comments (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    entity_type   text not null,
    entity_id     uuid not null,
    author_id     uuid references auth.users(id) on delete set null,
    author_name   text not null default 'Someone',
    body          text not null,
    created_at    timestamptz not null default now()
);

create table if not exists notifications (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users(id) on delete cascade,
    project_id    uuid references projects(id) on delete cascade,
    body          text not null,
    read          boolean not null default false,
    created_at    timestamptz not null default now()
);

create table if not exists activity_events (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    actor_name    text not null default 'Someone',
    entity_type   text not null,
    entity_id     uuid not null,
    action        text not null,
    created_at    timestamptz not null default now()
);

create table if not exists attachments (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    entity_type   text not null,
    entity_id     uuid not null,
    file_path     text not null, -- Supabase Storage object path
    file_name     text not null,
    size_bytes    bigint not null default 0,
    added_at      timestamptz not null default now()
);

create table if not exists saved_views (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references projects(id) on delete cascade,
    name          text not null,
    view_type     text not null,
    filter_json   text not null default '{}'
);

-- Real project sharing: a share code any signed-in user can redeem to
-- get their own copy of the project (used by the Cloud panel's Share
-- feature, replacing the desktop app's file-based export/import-by-link).
create table if not exists project_shares (
    id              uuid primary key default gen_random_uuid(),
    project_id      uuid not null references projects(id) on delete cascade,
    owner_id        uuid not null references auth.users(id) on delete cascade,
    share_code      text not null unique,
    recipient_email text,
    expires_at      timestamptz not null,
    created_at      timestamptz not null default now()
);

create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_requirements_project on requirements(project_id);
create index if not exists idx_trace_links_project on trace_links(project_id);
create index if not exists idx_trace_links_source on trace_links(source_type, source_id);
create index if not exists idx_trace_links_target on trace_links(target_type, target_id);
create index if not exists idx_decisions_project on decisions(project_id);
create index if not exists idx_meeting_notes_project on meeting_notes(project_id);
create index if not exists idx_baselines_project on baselines(project_id);
create index if not exists idx_sprints_project on sprints(project_id);
create index if not exists idx_tasks_sprint on tasks(sprint_id);

-- ---------------------------------------------------------------
-- Row Level Security
-- Phase-1 policy: any signed-in user can read/write any row. This
-- matches the desktop app's single-user-per-database model for an
-- initial web launch. Before inviting outside collaborators, tighten
-- these to check project_members for the requesting user.
-- ---------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'projects','project_members','tasks','task_links','milestones','requirements',
    'sysml_elements','diagrams','diagram_nodes','diagram_edges','trace_links','risks',
    'decisions','meeting_notes','baselines','sprints','comments','notifications',
    'activity_events','attachments','saved_views','project_shares'
  ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists allow_all_authenticated on %I;', t);
    execute format(
      'create policy allow_all_authenticated on %I for all to authenticated using (true) with check (true);', t
    );
  end loop;
end $$;

-- Storage bucket for attachments. Create it once (Storage > New bucket
-- > name "attachments", private) — this just documents the expected
-- name; buckets aren't created via SQL.
