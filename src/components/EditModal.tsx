import { useState } from "react";
import type { ChangeEvent } from "react";
import { Modal } from "./Modal";
import { ButtonRow, TextArea, TextInput } from "./FormControls";
import type { EditTarget } from "../types";

interface EditModalProps {
  /** Mount this with a `key` tied to the item so the draft resets per edit. */
  target: EditTarget;
  onClose: () => void;
  onSave: (target: EditTarget) => boolean;
}

const TITLES: Record<EditTarget["type"], string> = {
  learned: "Edit Insight",
  target: "Edit Target",
  "note-group": "Edit Note",
  "note-general": "Edit Note",
  sched: "Edit Activity",
};

/** One sheet handling every editable entity, driven by the `type` discriminant. */
export const EditModal = ({ target, onClose, onSave }: EditModalProps) => {
  const [draft, setDraft] = useState<EditTarget>(target);

  // Aside from `type` and the ids, every field on every branch is a string, so
  // patching one key by name can never disturb the discriminant.
  const set =
    (key: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((prev) => ({ ...prev, [key]: e.target.value }) as EditTarget);

  const handleSave = () => {
    if (onSave(draft)) onClose();
  };

  return (
    <Modal show onClose={onClose} title={TITLES[draft.type]}>
      {draft.type === "learned" && (
        <TextArea ph="Insight..." val={draft.text} chg={set("text")} />
      )}

      {(draft.type === "note-group" || draft.type === "note-general") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput ph="Title..." val={draft.title} chg={set("title")} />
          <TextArea ph="Content..." val={draft.body} chg={set("body")} />
        </div>
      )}

      {draft.type === "target" && (
        <TextInput ph="Target..." val={draft.title} chg={set("title")} />
      )}

      {draft.type === "sched" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput ph="Time (e.g. 08:00)" val={draft.time} chg={set("time")} />
          <TextInput ph="Activity title..." val={draft.title} chg={set("title")} />
          <TextInput ph="Description..." val={draft.desc} chg={set("desc")} />
        </div>
      )}

      <ButtonRow onCancel={onClose} onSave={handleSave} label="Save Changes" />
    </Modal>
  );
};
