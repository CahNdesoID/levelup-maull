import { AlertTriangle, X } from "lucide-react";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";

interface PersistBannerProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Surfaces a failed write instead of letting it pass silently.
 *
 * Without this, a photo that overflows the storage quota looks like it saved —
 * the UI updates from React state — and the loss only shows up after a reload.
 */
export const PersistBanner = ({ message, onDismiss }: PersistBannerProps) => (
  <div
    role="alert"
    style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 76,
      zIndex: 200,
      padding: "0 16px",
    }}
  >
    <div
      style={{
        maxWidth: MAX_CONTENT_WIDTH,
        margin: "0 auto",
        background: T.red,
        borderRadius: 16,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 10px 30px rgba(224,92,92,.3)",
      }}
    >
      <AlertTriangle size={18} color="white" strokeWidth={2.4} style={{ flexShrink: 0 }} />
      <p style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "white", lineHeight: 1.5 }}>
        {message}
      </p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: "rgba(255,255,255,.2)",
          border: "none",
          borderRadius: "50%",
          width: 26,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <X size={14} color="white" strokeWidth={2.6} />
      </button>
    </div>
  </div>
);
