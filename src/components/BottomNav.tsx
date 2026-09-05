import { BookMarked, CalendarDays, Home, UserCircle2, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";
import type { TabId } from "../types";

interface NavEntry {
  id: TabId;
  Icon: LucideIcon;
  label: string;
}

const NAV_ITEMS: NavEntry[] = [
  { id: "home", Icon: Home, label: "Home" },
  { id: "notes", Icon: BookMarked, label: "Notes" },
  { id: "learn", Icon: Zap, label: "Learn" },
  { id: "schedule", Icon: CalendarDays, label: "Schedule" },
  { id: "profile", Icon: UserCircle2, label: "Me" },
];

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    // The label is only painted for the active tab, so without this the other
    // four buttons expose no accessible name at all — just an icon.
    aria-label={label}
    aria-current={active ? "page" : undefined}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      padding: "4px",
      border: "none",
      background: "none",
      cursor: "pointer",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: active ? 6 : 0,
        background: active ? T.green : "transparent",
        padding: active ? "7px 16px" : "7px 10px",
        borderRadius: 999,
        transition: "all .28s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
        maxWidth: active ? 130 : 44,
      }}
    >
      <Icon size={18} color={active ? T.yellow : "#BBBBBB"} strokeWidth={active ? 2.5 : 1.8} />
      {active && (
        <span
          style={{
            color: T.yellow,
            fontSize: 11,
            fontWeight: 800,
            whiteSpace: "nowrap",
            letterSpacing: ".04em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  </button>
);

interface BottomNavProps {
  tab: TabId;
  onSelect: (tab: TabId) => void;
}

export const BottomNav = ({ tab, onSelect }: BottomNavProps) => (
  <nav
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: T.surf,
      borderTop: `1px solid ${T.border}`,
      boxShadow: "0 -4px 28px rgba(11,61,40,.07)",
      padding: "10px 8px 20px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        maxWidth: MAX_CONTENT_WIDTH,
        margin: "0 auto",
      }}
    >
      {NAV_ITEMS.map(({ id, Icon, label }) => (
        <NavItem
          key={id}
          icon={Icon}
          label={label}
          active={tab === id}
          onClick={() => onSelect(id)}
        />
      ))}
    </div>
  </nav>
);
