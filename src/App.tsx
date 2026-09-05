import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { EditModal } from "./components/EditModal";
import { FontLoader } from "./components/FontLoader";
import { PersistBanner } from "./components/PersistBanner";
import { PreviewOverlay } from "./components/PreviewOverlay";
import { HomeScreen } from "./screens/HomeScreen";
import { LearnScreen } from "./screens/LearnScreen";
import { NotesScreen } from "./screens/NotesScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ScheduleScreen } from "./screens/ScheduleScreen";
import { TrashScreen } from "./screens/TrashScreen";
import { AppDataProvider } from "./store/AppDataProvider";
import { useStore } from "./store/context";
import { T } from "./constants/theme";
import type { EditTarget, NotesView, Preview, TabId } from "./types";

/**
 * Navigation shell. Holds only view state — every piece of persisted data lives
 * in the store and is reached through `useStore()`.
 *
 * Screens are real components imported from modules, so React keeps their
 * identity stable across renders. The previous single-file version had to
 * invoke them as plain functions (`HomeScreen()`), because a component defined
 * inside `App` is a brand new type on every render and would have remounted the
 * whole subtree — dropping input focus and local state on every keystroke.
 */
const AppShell = () => {
  const { persistError, dismissPersistError } = useStore();

  const [tab, setTab] = useState<TabId>("home");
  const [notesView, setNotesView] = useState<NotesView>({ kind: "index" });
  const [trashOpen, setTrashOpen] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const { applyEdit } = useStore();

  const selectTab = (next: TabId) => {
    setTab(next);
    setNotesView({ kind: "index" });
    setTrashOpen(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: T.bg }}>
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 72,
        }}
      >
        {tab === "home" && <HomeScreen onNavigate={selectTab} />}

        {tab === "notes" && (
          <NotesScreen
            view={notesView}
            onViewChange={setNotesView}
            onPreview={setPreview}
            onEdit={setEditTarget}
          />
        )}

        {tab === "learn" && <LearnScreen onPreview={setPreview} onEdit={setEditTarget} />}

        {tab === "schedule" && <ScheduleScreen onEdit={setEditTarget} />}

        {tab === "profile" &&
          (trashOpen ? (
            <TrashScreen onBack={() => setTrashOpen(false)} />
          ) : (
            <ProfileScreen
              onOpenTrash={() => setTrashOpen(true)}
              onPreview={setPreview}
              onEdit={setEditTarget}
            />
          ))}
      </div>

      {editTarget && (
        // Keyed so the draft resets when a different item is opened.
        <EditModal
          key={`${editTarget.type}:${editTarget.id}`}
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={applyEdit}
        />
      )}

      <PreviewOverlay preview={preview} onClose={() => setPreview(null)} />

      {persistError && (
        <PersistBanner message={persistError} onDismiss={dismissPersistError} />
      )}

      <BottomNav tab={tab} onSelect={selectTab} />
    </div>
  );
};

export default function App() {
  return (
    <>
      <FontLoader />
      <AppDataProvider>
        <AppShell />
      </AppDataProvider>
    </>
  );
}
