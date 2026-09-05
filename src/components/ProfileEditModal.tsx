import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Modal } from "./Modal";
import { ButtonRow, TextInput } from "./FormControls";
import { T } from "../constants/theme";
import { downscaleToDataUrl } from "../utils/image";
import type { Avatar } from "../types";

interface ProfileEditModalProps {
  /** Mount only while open — the parent conditionally renders it — so the
   *  draft always starts from the saved values instead of a stale edit. */
  onClose: () => void;
  userName: string;
  avatar: Avatar;
  onSave: (name: string, avatar: Avatar) => void;
}

const EMOJI_CHOICES = [
  "🧑‍💻", "👨‍🎓", "🎓", "🦁", "🦊", "🐺", "🦉", "🐸",
  "🚀", "🌟", "💎", "🎯", "🔥", "🧠", "💪", "⚡",
];

export const ProfileEditModal = ({
  onClose,
  userName,
  avatar,
  onSave,
}: ProfileEditModalProps) => {
  const [name, setName] = useState(userName);
  const [draftAvatar, setDraftAvatar] = useState<Avatar>(avatar);
  const [error, setError] = useState<string | null>(null);
  const inputId = useRef(`avatar-file-${Math.random().toString(36).slice(2)}`).current;

  const handleFile = async (file: File) => {
    setError(null);
    try {
      // Downscaled before it ever reaches storage — a raw phone photo would
      // blow past the localStorage quota on its own.
      const dataUrl = await downscaleToDataUrl(file);
      setDraftAvatar({ type: "photo", value: dataUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses gambar.");
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), draftAvatar);
    onClose();
  };

  const preview =
    draftAvatar.type === "photo" && draftAvatar.value ? (
      <img
        src={draftAvatar.value}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : draftAvatar.type === "emoji" ? (
      <span style={{ fontSize: 38 }}>{draftAvatar.value}</span>
    ) : (
      <span className="fd" style={{ fontSize: 34, fontWeight: 800, color: T.green }}>
        {(name || userName).charAt(0).toUpperCase()}
      </span>
    );

  return (
    <Modal show onClose={onClose} title="Edit Profile">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <label htmlFor={inputId} style={{ cursor: "pointer", display: "block" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: 28,
                overflow: "hidden",
                background: `linear-gradient(135deg,${T.yellow},#F5A800)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(237,216,0,.35)",
              }}
            >
              {preview}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -3,
                right: -3,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: T.green,
                border: "2.5px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <Camera size={13} color="white" />
            </div>
          </div>
        </label>

        <label
          htmlFor={inputId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: T.green,
            borderRadius: 999,
            padding: "8px 18px",
            cursor: "pointer",
          }}
        >
          <Camera size={14} color="white" />
          <span style={{ color: "white", fontSize: 13, fontWeight: 800 }}>Upload dari Galeri</span>
        </label>

        <input
          id={inputId}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />

        {error && (
          <p style={{ fontSize: 12, color: T.red, fontWeight: 600, textAlign: "center" }}>
            {error}
          </p>
        )}
      </div>

      <p
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: T.muted,
          marginBottom: 10,
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        Atau pilih emoji avatar
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {EMOJI_CHOICES.map((em) => {
          const selected = draftAvatar.type === "emoji" && draftAvatar.value === em;
          return (
            <button
              key={em}
              onClick={() => setDraftAvatar({ type: "emoji", value: em })}
              style={{
                fontSize: 28,
                border: `2px solid ${selected ? T.green : "transparent"}`,
                background: selected ? "rgba(11,61,40,.08)" : "none",
                borderRadius: 14,
                padding: "8px 4px",
                cursor: "pointer",
                transition: "all .15s",
                lineHeight: 1,
              }}
            >
              {em}
            </button>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: T.muted,
          marginBottom: 8,
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        Display name
      </p>
      <TextInput ph="Enter your name..." val={name} chg={(e) => setName(e.target.value)} />
      <ButtonRow onCancel={onClose} onSave={handleSave} label="Save Profile" />
    </Modal>
  );
};
