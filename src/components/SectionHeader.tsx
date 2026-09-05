import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./IconBadge";
import { T } from "../constants/theme";

interface SectionHeaderProps {
  icon: LucideIcon;
  /** Badge background colour. */
  ibg: string;
  /** Badge icon colour. */
  icol: string;
  title: string;
  btnLabel?: string;
  onBtn?: () => void;
}

export const SectionHeader = ({
  icon,
  ibg,
  icol,
  title,
  btnLabel,
  onBtn,
}: SectionHeaderProps) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <IconBadge icon={icon} bg={ibg} color={icol} sz={15} p={7} />
      <span className="fd" style={{ fontSize: 16, fontWeight: 800, color: T.green }}>
        {title}
      </span>
    </div>
    {btnLabel && (
      <button
        onClick={onBtn}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: T.green,
          border: "none",
          borderRadius: 999,
          padding: "7px 14px",
          cursor: "pointer",
          color: "white",
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        <Plus size={13} />
        {btnLabel}
      </button>
    )}
  </div>
);
