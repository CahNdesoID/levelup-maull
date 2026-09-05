import { ChevronLeft, Trash2 } from "lucide-react";
import { Card } from "../components/Card";
import { Hero } from "../components/Hero";
import { MAX_CONTENT_WIDTH, T, TRASH_TTL_MS } from "../constants/theme";
import { useStore } from "../store/context";
import type { BinEntry } from "../types";

const TYPE_LABEL: Record<BinEntry["type"], string> = {
  learned: "Insight",
  "note-group": "Note (Grup)",
  "note-general": "General Note",
  target: "Target",
  sched: "Schedule",
  group: "Grup Note",
};

/** Best available human label for a deleted item, narrowed per entry type. */
const describe = (entry: BinEntry): string => {
  switch (entry.type) {
    case "learned":
      return entry.data.text;
    case "group":
      return entry.data.name;
    case "note-group":
    case "note-general":
    case "target":
    case "sched":
      return entry.data.title;
  }
};

export const TrashScreen = ({ onBack }: { onBack: () => void }) => {
  const { activeBin, restoreFromBin, permDelete, emptyBin } = useStore();

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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1
              className="fd"
              style={{ color: "white", fontSize: 36, fontWeight: 800, letterSpacing: "-.02em" }}
            >
              TRASH
            </h1>
            <p style={{ color: T.sage, fontSize: 12, marginTop: 4 }}>
              {activeBin.length} item · Auto-delete setelah 30 hari
            </p>
          </div>
          {activeBin.length > 0 && (
            <button
              onClick={emptyBin}
              style={{
                background: "rgba(224,92,92,.2)",
                border: "none",
                borderRadius: 999,
                padding: "7px 16px",
                cursor: "pointer",
                color: T.red,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Empty Bin
            </button>
          )}
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
        {activeBin.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: T.muted }}>
            <Trash2 size={44} color={T.border} style={{ margin: "0 auto 14px" }} />
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Trash kosong</p>
            <p style={{ fontSize: 13 }}>Item yang dihapus akan muncul di sini</p>
          </div>
        )}

        {activeBin.map((entry) => {
          const daysLeft = Math.max(
            1,
            Math.ceil((TRASH_TTL_MS - (Date.now() - entry.deletedAt)) / (24 * 60 * 60 * 1000)),
          );

          return (
            <Card key={entry.binId} p={18}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ background: T.border, borderRadius: 999, padding: "2px 9px" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: T.muted,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    {TYPE_LABEL[entry.type]}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: T.muted }}>{daysLeft}d left</span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: T.text,
                  lineHeight: 1.6,
                  marginBottom: 14,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {describe(entry)}
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => restoreFromBin(entry)}
                  style={{
                    flex: 1,
                    background: T.green,
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 0",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Restore
                </button>
                <button
                  onClick={() => permDelete(entry.binId)}
                  style={{
                    flex: 1,
                    background: "none",
                    color: T.red,
                    border: `1.5px solid ${T.red}`,
                    borderRadius: 12,
                    padding: "9px 0",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Hapus Permanen
                </button>
              </div>
            </Card>
          );
        })}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
};
