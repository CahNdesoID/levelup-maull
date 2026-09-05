import type { ChangeEvent, CSSProperties } from "react";
import { T } from "../constants/theme";

type InputChange = (e: ChangeEvent<HTMLInputElement>) => void;
type TextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => void;

interface TextInputProps {
  ph: string;
  val: string;
  chg: InputChange;
  style?: CSSProperties;
}

export const TextInput = ({ ph, val, chg, style = {} }: TextInputProps) => (
  <input
    placeholder={ph}
    value={val}
    onChange={chg}
    style={{
      width: "100%",
      border: `1.5px solid ${T.border}`,
      borderRadius: 14,
      padding: "13px 16px",
      fontSize: 14,
      color: T.text,
      outline: "none",
      background: T.surf,
      transition: "border .15s",
      ...style,
    }}
    onFocus={(e) => {
      e.target.style.borderColor = T.green;
      e.target.select();
    }}
    onBlur={(e) => {
      e.target.style.borderColor = T.border;
    }}
  />
);

interface TextAreaProps {
  ph: string;
  val: string;
  chg: TextAreaChange;
}

export const TextArea = ({ ph, val, chg }: TextAreaProps) => (
  <textarea
    placeholder={ph}
    value={val}
    onChange={chg}
    rows={4}
    style={{
      width: "100%",
      border: `1.5px solid ${T.border}`,
      borderRadius: 14,
      padding: "13px 16px",
      fontSize: 14,
      color: T.text,
      outline: "none",
      background: T.surf,
      resize: "none",
      lineHeight: 1.6,
    }}
    onFocus={(e) => {
      e.target.style.borderColor = T.green;
    }}
    onBlur={(e) => {
      e.target.style.borderColor = T.border;
    }}
  />
);

interface ButtonRowProps {
  onCancel: () => void;
  onSave: () => void;
  label?: string;
}

export const ButtonRow = ({ onCancel, onSave, label = "Save" }: ButtonRowProps) => (
  <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
    <button
      onClick={onCancel}
      style={{
        flex: 1,
        border: `1.5px solid ${T.border}`,
        borderRadius: 14,
        padding: "13px 0",
        fontSize: 14,
        fontWeight: 700,
        color: T.muted,
        background: "none",
        cursor: "pointer",
      }}
    >
      Cancel
    </button>
    <button
      onClick={onSave}
      style={{
        flex: 1,
        background: T.green,
        border: "none",
        borderRadius: 14,
        padding: "13px 0",
        fontSize: 14,
        fontWeight: 800,
        color: "white",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  </div>
);
