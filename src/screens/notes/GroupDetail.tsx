import { useState } from "react";
import { ChevronLeft, FileText, Plus } from "lucide-react";
import { Card } from "../../components/Card";
import { Hero } from "../../components/Hero";
import { Modal } from "../../components/Modal";
import { SwipeActions } from "../../components/SwipeActions";
import { ButtonRow, TextArea, TextInput } from "../../components/FormControls";
import { MAX_CONTENT_WIDTH, T } from "../../constants/theme";
import { isoToDisplay } from "../../utils/date";
import { useStore } from "../../store/context";
import type { EditTarget, Id, Preview } from "../../types";

interface GroupDetailProps {
  groupId: Id;
  onBack: () => void;
  onPreview: (preview: Preview) => void;
  onEdit: (target: EditTarget) => void;
}

export const GroupDetail = ({ groupId, onBack, onPreview, onEdit }: GroupDetailProps) => {
  const { data, addNote, delNote } = useStore();
  const group = data.groups.find((g) => g.id === groupId);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // The group can disappear underneath this view (deleted from the index, or
  // restored elsewhere), so bounce back rather than rendering nothing.
  if (!group) {
    return (
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Hero pt={48}>
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,.1)",
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              cursor: "pointer",
              color: T.sage,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <ChevronLeft size={14} /> Back
          </button>
        </Hero>
        <p style={{ textAlign: "center", padding: "40px 16px", color: T.muted, fontSize: 13 }}>
          Grup ini sudah tidak ada.
        </p>
      </div>
    );
  }

  const submit = () => {
    if (!addNote(group.id, title, body)) return;
    setTitle("");
    setBody("");
    setOpen(false);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Hero pt={48}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,.1)",
            border: "none",
            borderRadius: 999,
            padding: "6px 14px",
            cursor: "pointer",
            color: T.sage,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: group.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {group.emoji}
          </div>
          <div>
            <h1
              className="fd"
              style={{ color: "white", fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}
            >
              {group.name}
            </h1>
            <p style={{ color: T.sage, fontSize: 12, marginTop: 2 }}>
              {group.notes.length} notes
            </p>
          </div>
        </div>
      </Hero>

      <div
        style={{
          padding: "20px 16px",
          maxWidth: MAX_CONTENT_WIDTH,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: T.green,
            border: "none",
            borderRadius: 16,
            padding: "14px 0",
            cursor: "pointer",
            color: "white",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <Plus size={16} /> Add Note
        </button>

        {group.notes.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
            <FileText size={40} color={T.border} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 700, marginBottom: 4 }}>No notes yet</p>
            <p style={{ fontSize: 13 }}>Tap the button above to add the first note</p>
          </div>
        )}

        {group.notes.map((n) => (
          <SwipeActions
            key={n.id}
            radius={20}
            onDelete={() => delNote(group.id, n.id)}
            onEdit={() =>
              onEdit({
                type: "note-group",
                id: n.id,
                gid: group.id,
                title: n.title,
                body: n.body,
              })
            }
          >
            <Card
              p={20}
              style={{ borderRadius: 20, boxShadow: "none" }}
              onClick={() =>
                onPreview({
                  type: "note",
                  title: n.title,
                  body: n.body,
                  date: n.date,
                  color: group.color,
                  groupName: group.name,
                })
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: group.color,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <p className="fd" style={{ fontSize: 16, fontWeight: 800, color: T.green }}>
                    {n.title}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: T.muted, flexShrink: 0, marginLeft: 8 }}>
                  {isoToDisplay(n.date)}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.65,
                  paddingLeft: 16,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {n.body}
              </p>
            </Card>
          </SwipeActions>
        ))}

        <div style={{ height: 8 }} />
      </div>

      <Modal show={open} onClose={() => setOpen(false)} title={`New Note — ${group.name}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput ph="Note title..." val={title} chg={(e) => setTitle(e.target.value)} />
          <TextArea
            ph="Write your notes here..."
            val={body}
            chg={(e) => setBody(e.target.value)}
          />
          <ButtonRow onCancel={() => setOpen(false)} onSave={submit} label="Save Note" />
        </div>
      </Modal>
    </div>
  );
};
