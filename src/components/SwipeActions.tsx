import { useRef, useState } from "react";
import type { ReactNode, TouchEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface SwipeActionsProps {
  onDelete?: () => void;
  onEdit?: () => void;
  children: ReactNode;
  radius?: number;
}

const THRESHOLD = 76;
/** Fraction of the threshold that must be crossed to commit the action. */
const COMMIT_RATIO = 0.72;

/**
 * Swipe a row right to delete, left to edit.
 *
 * Touch only — there is no pointer/mouse fallback, so these actions are
 * unreachable on a desktop browser. Every action exposed here is also reachable
 * from a tap target elsewhere in the UI, so this is a convenience rather than
 * the sole path.
 */
export const SwipeActions = ({ onDelete, onEdit, children, radius = 0 }: SwipeActionsProps) => {
  const [dx, setDx] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientX - startX.current;
    setDx(Math.max(-(THRESHOLD + 8), Math.min(THRESHOLD + 8, delta)));
  };

  const handleTouchEnd = () => {
    dragging.current = false;
    if (dx >= THRESHOLD * COMMIT_RATIO) onDelete?.();
    if (dx <= -THRESHOLD * COMMIT_RATIO) onEdit?.();
    setDx(0);
  };

  const deleteProgress = Math.min(Math.max(dx, 0) / THRESHOLD, 1);
  const editProgress = Math.min(Math.max(-dx, 0) / THRESHOLD, 1);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: radius }}>
      {dx > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: `rgb(${Math.round(224 - deleteProgress * 20)},${Math.round(92 - deleteProgress * 10)},${Math.round(92 - deleteProgress * 10)})`,
            display: "flex",
            alignItems: "center",
            paddingLeft: Math.max(dx * 0.38, 10),
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(255,255,255,.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${0.3 + deleteProgress * 0.7})`,
              opacity: Math.min(dx / 18, 1),
            }}
          >
            <Trash2 size={19} color="white" strokeWidth={2.2} />
          </div>
        </div>
      )}

      {dx < 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: `rgb(${Math.round(11 + editProgress * 30)},${Math.round(100 + editProgress * 30)},${Math.round(60 + editProgress * 20)})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: Math.max(-dx * 0.38, 10),
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(255,255,255,.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${0.3 + editProgress * 0.7})`,
              opacity: Math.min(-dx / 18, 1),
            }}
          >
            <Pencil size={17} color="white" strokeWidth={2.2} />
          </div>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform .35s cubic-bezier(.34,1.4,.64,1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};
