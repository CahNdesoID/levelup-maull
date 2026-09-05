import { T } from "../constants/theme";
import type { Preview } from "../types";

interface PreviewOverlayProps {
  preview: Preview | null;
  onClose: () => void;
}

const Label = ({ dot, text }: { dot: string; text: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: T.muted,
        textTransform: "uppercase",
        letterSpacing: ".08em",
      }}
    >
      {text}
    </span>
  </div>
);

/** Full-screen blurred backdrop showing one item's complete content. */
export const PreviewOverlay = ({ preview, onClose }: PreviewOverlayProps) => {
  if (!preview) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        className="fly-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surf,
          borderRadius: 28,
          padding: 28,
          width: "100%",
          maxWidth: 520,
          maxHeight: "78vh",
          overflowY: "auto",
          boxShadow: "0 28px 80px rgba(0,0,0,.35), 0 4px 20px rgba(0,0,0,.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div style={{ flex: 1, paddingRight: 12 }}>
            {preview.type === "note" && (
              <>
                <Label dot={preview.color || T.sage} text={preview.groupName || "Note"} />
                <p
                  className="fd selectable"
                  style={{ fontSize: 22, fontWeight: 800, color: T.green, lineHeight: 1.2 }}
                >
                  {preview.title}
                </p>
              </>
            )}
            {preview.type === "general" && (
              <>
                <Label dot={T.lav} text="General Note" />
                <p
                  className="fd selectable"
                  style={{ fontSize: 22, fontWeight: 800, color: T.green, lineHeight: 1.2 }}
                >
                  {preview.title}
                </p>
              </>
            )}
            {preview.type === "learned" && (
              <Label dot={T.success} text="Learning Insight" />
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close preview"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: T.bg,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 20,
              color: T.muted,
              lineHeight: 1,
              fontWeight: 300,
            }}
          >
            ×
          </button>
        </div>

        {(preview.type === "note" || preview.type === "general") && (
          <>
            <p
              className="selectable"
              style={{
                fontSize: 14,
                color: "#444",
                lineHeight: 1.85,
                marginBottom: 20,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {preview.body || "(no content)"}
            </p>
            <div style={{ paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
                {preview.date}
              </span>
            </div>
          </>
        )}

        {preview.type === "learned" && (
          <>
            <p
              className="selectable"
              style={{
                fontSize: 16,
                color: T.text,
                lineHeight: 1.85,
                margin: "12px 0 20px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {preview.text}
            </p>
            <div style={{ paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
                {preview.date}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
