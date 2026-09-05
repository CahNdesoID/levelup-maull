import { useState } from "react";
import { ChevronRight, FileText, FolderOpen } from "lucide-react";
import { Card } from "../../components/Card";
import { Hero } from "../../components/Hero";
import { Modal } from "../../components/Modal";
import { SectionHeader } from "../../components/SectionHeader";
import { SwipeActions } from "../../components/SwipeActions";
import { ButtonRow, TextArea, TextInput } from "../../components/FormControls";
import { MAX_CONTENT_WIDTH, T } from "../../constants/theme";
import { useStore } from "../../store/context";
import type { Id } from "../../types";

interface NotesIndexProps {
  onOpenGroup: (id: Id) => void;
  onOpenGeneral: () => void;
}

export const NotesIndex = ({ onOpenGroup, onOpenGeneral }: NotesIndexProps) => {
  const { data, allNotesCount, addGroup, addNote, delGroup } = useStore();

  const [modal, setModal] = useState<"group" | "note" | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const submitGroup = () => {
    if (!addGroup(groupName, groupEmoji)) return;
    setGroupName("");
    setGroupEmoji("");
    setModal(null);
  };

  const submitNote = () => {
    if (!addNote(null, noteTitle, noteBody)) return;
    setNoteTitle("");
    setNoteBody("");
    setModal(null);
  };

  const firstGeneral = data.general[0];

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Hero>
        <h1
          className="fd"
          style={{ color: "white", fontSize: 40, fontWeight: 800, letterSpacing: "-.02em" }}
        >
          MY NOTES
        </h1>
        <p style={{ color: T.sage, fontSize: 12, marginTop: 6 }}>
          {data.groups.length} groups · {allNotesCount} total notes
        </p>
      </Hero>

      <div
        style={{
          padding: "20px 16px",
          maxWidth: MAX_CONTENT_WIDTH,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <SectionHeader
            icon={FolderOpen}
            ibg="rgba(237,216,0,.2)"
            icol={T.green}
            title="Group Notes"
            btnLabel="New Group"
            onBtn={() => {
              setGroupName("");
              setGroupEmoji("");
              setModal("group");
            }}
          />

          {data.groups.length === 0 && (
            <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "24px 0" }}>
              Belum ada grup. Bikin satu buat mengelompokkan catatanmu.
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {data.groups.map((g) => (
              <SwipeActions key={g.id} radius={20} onDelete={() => delGroup(g.id)}>
                <Card
                  bg={g.color}
                  p={20}
                  onClick={() => onOpenGroup(g.id)}
                  style={{ borderRadius: 20, boxShadow: "none" }}
                >
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{g.emoji}</div>
                  <p
                    className="fd"
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: T.green,
                      lineHeight: 1.2,
                      marginBottom: 4,
                    }}
                  >
                    {g.name}
                  </p>
                  <p style={{ fontSize: 12, color: T.green, opacity: 0.6 }}>
                    {g.notes.length} notes
                  </p>
                </Card>
              </SwipeActions>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            icon={FileText}
            ibg="rgba(11,61,40,.08)"
            icol={T.green}
            title="General Notes"
            btnLabel="Add Note"
            onBtn={() => setModal("note")}
          />
          <Card p={0} onClick={onOpenGeneral} style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p className="fd" style={{ fontSize: 16, fontWeight: 800, color: T.green }}>
                  All General Notes
                </p>
                <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  {data.general.length} notes saved
                </p>
              </div>
              <ChevronRight size={18} color={T.muted} />
            </div>

            {firstGeneral && (
              <div style={{ padding: "14px 24px", background: T.bg }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 4 }}>
                  {firstGeneral.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: T.muted,
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {firstGeneral.body}
                </p>
              </div>
            )}
          </Card>
        </div>

        <div style={{ height: 8 }} />
      </div>

      <Modal show={modal === "group"} onClose={() => setModal(null)} title="New Note Group">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <TextInput
              ph="📝"
              val={groupEmoji}
              chg={(e) => setGroupEmoji(e.target.value)}
              style={{ width: 64, textAlign: "center", fontSize: 22, padding: "13px 6px" }}
            />
            <TextInput
              ph="Group name (e.g. Belajar HTML)"
              val={groupName}
              chg={(e) => setGroupName(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <p style={{ fontSize: 12, color: T.muted }}>
            Tip: type one emoji in the left box, then the group name.
          </p>
          <ButtonRow onCancel={() => setModal(null)} onSave={submitGroup} label="Create Group" />
        </div>
      </Modal>

      <Modal show={modal === "note"} onClose={() => setModal(null)} title="New General Note">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput ph="Note title..." val={noteTitle} chg={(e) => setNoteTitle(e.target.value)} />
          <TextArea
            ph="Write your thoughts..."
            val={noteBody}
            chg={(e) => setNoteBody(e.target.value)}
          />
          <ButtonRow onCancel={() => setModal(null)} onSave={submitNote} label="Save Note" />
        </div>
      </Modal>
    </div>
  );
};
