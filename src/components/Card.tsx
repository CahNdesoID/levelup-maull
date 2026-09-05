import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { T } from "../constants/theme";

interface CardProps {
  children: ReactNode;
  bg?: string;
  style?: CSSProperties;
  onClick?: () => void;
  /** Padding in px. */
  p?: number;
}

/** Floating surface that lifts on hover. */
export const Card = ({ children, bg = T.surf, style = {}, onClick, p = 24 }: CardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        borderRadius: 24,
        overflow: "hidden",
        padding: p,
        transition: "transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 52px rgba(11,61,40,.16),0 4px 14px rgba(0,0,0,.08)"
          : "0 4px 20px rgba(11,61,40,.09),0 1px 4px rgba(0,0,0,.04)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
