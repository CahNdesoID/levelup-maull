import type { ReactNode } from "react";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";

interface HeroProps {
  children: ReactNode;
  /** Top padding in px — screens with a back button use a smaller value. */
  pt?: number;
}

/** Dark green rounded header used at the top of every screen. */
export const Hero = ({ children, pt = 52 }: HeroProps) => (
  <div
    style={{
      background: T.green,
      borderRadius: "0 0 40px 40px",
      padding: `${pt}px 24px 28px`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.04,
        backgroundImage:
          "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: -60,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle,#EDD80022 0%,transparent 70%)",
      }}
    />
    <div style={{ position: "relative", maxWidth: MAX_CONTENT_WIDTH, margin: "0 auto" }}>
      {children}
    </div>
  </div>
);
