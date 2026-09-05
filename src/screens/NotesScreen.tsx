import { GeneralNotes } from "./notes/GeneralNotes";
import { GroupDetail } from "./notes/GroupDetail";
import { NotesIndex } from "./notes/NotesIndex";
import type { EditTarget, NotesView, Preview } from "../types";

interface NotesScreenProps {
  view: NotesView;
  onViewChange: (view: NotesView) => void;
  onPreview: (preview: Preview) => void;
  onEdit: (target: EditTarget) => void;
}

/**
 * Routes between the three notes views.
 *
 * The view is a tagged union rather than the old `number | "general" | null`,
 * which relied on `typeof view === "number"` to spot a group id — a test that
 * silently stopped working the moment group ids became UUID strings.
 */
export const NotesScreen = ({ view, onViewChange, onPreview, onEdit }: NotesScreenProps) => {
  const backToIndex = () => onViewChange({ kind: "index" });

  if (view.kind === "group") {
    return (
      <GroupDetail
        groupId={view.id}
        onBack={backToIndex}
        onPreview={onPreview}
        onEdit={onEdit}
      />
    );
  }

  if (view.kind === "general") {
    return <GeneralNotes onBack={backToIndex} onPreview={onPreview} onEdit={onEdit} />;
  }

  return (
    <NotesIndex
      onOpenGroup={(id) => onViewChange({ kind: "group", id })}
      onOpenGeneral={() => onViewChange({ kind: "general" })}
    />
  );
};
