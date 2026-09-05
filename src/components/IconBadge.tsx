import type { LucideIcon } from "lucide-react";

interface IconBadgeProps {
  icon: LucideIcon;
  bg: string;
  color: string;
  /** Icon size in px; the badge sizes itself from this plus padding. */
  sz?: number;
  p?: number;
}

/** Circular tinted background behind a single icon. */
export const IconBadge = ({ icon: Icon, bg, color, sz = 16, p = 9 }: IconBadgeProps) => (
  <div
    style={{
      background: bg,
      borderRadius: 999,
      flexShrink: 0,
      width: sz + p * 2,
      height: sz + p * 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Icon size={sz} color={color} strokeWidth={2.2} />
  </div>
);
