import type { ReactNode } from "react";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Bottom sheet. Renders nothing when hidden, so inputs reset between opens. */
export const Modal = ({ show, onClose, title, children }: ModalProps) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "flex-end",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.surf,
          width: "100%",
          maxWidth: MAX_CONTENT_WIDTH,
          margin: "0 auto",
          borderRadius: "28px 28px 0 0",
          padding: "28px 24px 44px",
          boxShadow: "0 -8px 40px rgba(0,0,0,.14)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: T.border,
            borderRadius: 99,
            margin: "0 auto 22px",
          }}
        />
        <p
          className="fd"
          style={{ fontSize: 20, fontWeight: 800, color: T.green, marginBottom: 20 }}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  );
};
