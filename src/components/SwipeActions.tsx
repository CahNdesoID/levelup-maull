import { useRef, useState } from "react";
import type { MouseEvent, PointerEvent, ReactNode } from "react";
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
/** Movement before a gesture is classified, so a tap is never a tiny swipe. */
const SLOP = 6;

type Axis = "undecided" | "horizontal" | "vertical";

/**
 * Swipe a row right to delete, left to edit.
 *
 * Built on Pointer Events, so it works with a mouse as well as touch — the
 * earlier touch-only version left both actions unreachable on desktop.
 *
 * Two details make it coexist with the tap handlers on the rows it wraps:
 * `touch-action: pan-y` lets the browser keep vertical scrolling while we claim
 * horizontal movement, and a click that follows an actual drag is swallowed in
 * the capture phase so a swipe never also opens the item.
 */
export const SwipeActions = ({ onDelete, onEdit, children, radius = 0 }: SwipeActionsProps) => {
  const [dx, setDx] = useState(0);

  const active = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<Axis>("undecided");
  const dragged = useRef(false);
  // Mirrors `dx` for the pointerup handler, which needs the committed value
  // without waiting for a re-render.
  const offset = useRef(0);

  const applyOffset = (value: number) => {
    offset.current = value;
    setDx(value);
  };

  const reset = () => {
    active.current = false;
    axis.current = "undecided";
    applyOffset(0);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Ignore secondary mouse buttons; let the context menu behave normally.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    active.current = true;
    dragged.current = false;
    axis.current = "undecided";
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;

    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    if (axis.current === "undecided") {
      if (Math.abs(deltaX) < SLOP && Math.abs(deltaY) < SLOP) return;
      axis.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
      if (axis.current === "horizontal") {
        // Keep receiving moves even if the pointer leaves this element.
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }

    if (axis.current !== "horizontal") return;

    dragged.current = true;
    applyOffset(Math.max(-(THRESHOLD + 8), Math.min(THRESHOLD + 8, deltaX)));
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!active.current) return;

    if (axis.current === "horizontal") {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (offset.current >= THRESHOLD * COMMIT_RATIO) onDelete?.();
      if (offset.current <= -THRESHOLD * COMMIT_RATIO) onEdit?.();
    }

    reset();
  };

  // Fires when the browser takes the gesture over — a vertical scroll, mostly.
  const handlePointerCancel = () => {
    if (!active.current) return;
    reset();
  };

  const handleClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragged.current) return;
    // A drag just ended; don't let it also count as a tap on the row.
    e.stopPropagation();
    e.preventDefault();
    dragged.current = false;
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        style={{
          transform: `translateX(${dx}px)`,
          transition: active.current ? "none" : "transform .35s cubic-bezier(.34,1.4,.64,1)",
          position: "relative",
          zIndex: 1,
          // The browser keeps vertical panning; horizontal is ours.
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
};
