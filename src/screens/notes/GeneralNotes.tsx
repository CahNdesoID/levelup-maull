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
import type { EditTarget, Preview } from "../../types";

interface GeneralNotesProps {
  onBack: () => void;
  onPreview: (preview: Preview) => void;
  onEdit: (target: EditTarget) => void;
}

export const GeneralNotes = ({ onBack, onPreview, onEdit }: GeneralNotesProps) => {
  const { data, addNote, delGeneral } = useStore();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!addNote(null, title, body)) return;
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
              background: "rgba(255,255,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={22} color="white" />
          </div>
          <div>
            <h1 className="fd" style={{ color: "white", fontSize: 28, fontWeight: 800 }}>
              General Notes
            </h1>
            <p style={{ color: T.sage, fontSize: 12, marginTop: 2 }}>
              {data.general.length} notes
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
          <Plus size={16} /> Add General Note
        </button>

        {data.general.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
            <FileText size={40} color={T.border} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 700, marginBottom: 4 }}>No notes yet</p>
            <p style={{ fontSize: 13 }}>Tap the button above to add the first note</p>
          </div>
        )}

        {data.general.map((n) => (
          <SwipeActions
            key={n.id}
            radius={20}
            onDelete={() => delGeneral(n.id)}
            onEdit={() =>
              onEdit({ type: "note-general", id: n.id, title: n.title, body: n.body })
            }
          >
            <Card
              p={20}
              style={{ borderRadius: 20, boxShadow: "none" }}
              onClick={() =>
                onPreview({ type: "general", title: n.title, body: n.body, date: n.date })
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p className="fd" style={{ fontSize: 16, fontWeight: 800, color: T.green }}>
                  {n.title}
                </p>
                <span style={{ fontSize: 11, color: T.muted }}>{isoToDisplay(n.date)}</span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.65,
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

      <Modal show={open} onClose={() => setOpen(false)} title="New General Note">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput ph="Note title..." val={title} chg={(e) => setTitle(e.target.value)} />
          <TextArea
            ph="Write your thoughts..."
            val={body}
            chg={(e) => setBody(e.target.value)}
          />
          <ButtonRow onCancel={() => setOpen(false)} onSave={submit} label="Save Note" />
        </div>
      </Modal>
    </div>
  );
};
