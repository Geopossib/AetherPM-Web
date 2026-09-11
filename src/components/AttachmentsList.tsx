import { useEffect, useRef, useState } from "react";
import { Paperclip, Trash2, Plus } from "lucide-react";
import { api, Attachment } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export function AttachmentsList({ projectId, entityType, entityId }: { projectId: string; entityType: string; entityId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    api.listAttachments(projectId, entityType, entityId).then(setAttachments).catch(console.error);
  };
  useEffect(refresh, [projectId, entityType, entityId]);

  const pickFile = () => fileInputRef.current?.click();

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const storagePath = `${projectId}/${entityType}/${entityId}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("attachments").upload(storagePath, file);
      if (error) throw error;
      await api.addAttachment(projectId, entityType, entityId, storagePath, file.name, file.size);
      refresh();
    } catch (err) {
      window.alert(`Couldn't upload file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const openFile = async (a: Attachment) => {
    const { data, error } = await supabase.storage.from("attachments").createSignedUrl(a.file_path, 60);
    if (error) {
      window.alert(`Couldn't open file: ${error.message}`);
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (id: string) => {
    await api.deleteAttachment(id);
    refresh();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>Attachments</h3>
        <button onClick={pickFile} disabled={uploading} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--accent-text)" }}>
          <Plus size={12} /> {uploading ? "Uploading…" : "Add file"}
        </button>
        <input ref={fileInputRef} type="file" onChange={onFileChosen} style={{ display: "none" }} />
      </div>
      {attachments.length === 0 && <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No files attached.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {attachments.map((a) => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "6px 8px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
            <span
              onClick={() => openFile(a)}
              style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
            >
              <Paperclip size={12} style={{ flexShrink: 0, color: "var(--text-tertiary)" }} />
              {a.file_name}
            </span>
            <button onClick={() => remove(a.id)} style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
