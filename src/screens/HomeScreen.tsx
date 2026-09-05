import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { Card } from "../components/Card";
import { Hero } from "../components/Hero";
import { IconBadge } from "../components/IconBadge";
import { ProgressArc } from "../components/ProgressArc";
import { SectionHeader } from "../components/SectionHeader";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";
import { heroDate } from "../utils/date";
import { useStore } from "../store/context";
import type { TabId } from "../types";

export const HomeScreen = ({ onNavigate }: { onNavigate: (tab: TabId) => void }) => {
  const { data, doneCount, totalCount, pct, allNotesCount, todayLearned, userName } = useStore();

  const pills = [
    { I: BookOpen, v: `${allNotesCount} notes`, bg: "rgba(168,212,188,.18)", c: T.sage },
    { I: Target, v: `${doneCount}/${totalCount} targets`, bg: "rgba(237,216,0,.15)", c: T.yellow },
    { I: Sparkles, v: `${todayLearned.length} insights`, bg: "rgba(200,184,255,.18)", c: T.lav },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Hero>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(255,255,255,.1)",
            borderRadius: 999,
            padding: "4px 14px",
            marginBottom: 18,
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.success,
              boxShadow: `0 0 6px ${T.success}`,
              display: "inline-block",
            }}
          />
          <span
            style={{
              color: T.sage,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            {heroDate()}
          </span>
        </div>

        <h1
          className="fd"
          style={{
            color: "white",
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-.03em",
            marginBottom: 20,
          }}
        >
          DAILY
          <br />
          <span style={{ color: T.yellow }}>SNAP</span>SHOT
        </h1>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pills.map(({ I, v, bg, c }) => (
            <div
              key={v}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: bg,
                borderRadius: 999,
                padding: "5px 11px 5px 9px",
                border: `1px solid ${c}35`,
              }}
            >
              <I size={12} color={c} strokeWidth={2.2} />
              <span style={{ color: c, fontSize: 11, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </Hero>

      <div
        style={{
          padding: "20px 16px",
          maxWidth: MAX_CONTENT_WIDTH,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="fd" style={{ fontSize: 17, fontWeight: 800, color: T.green, marginBottom: 3 }}>
                Daily Progress
              </p>
              <p style={{ fontSize: 12, color: T.muted }}>{pct}% of your goals today</p>
            </div>
            <div
              style={{
                background: pct === 100 ? T.yellow : "#F0EAE0",
                borderRadius: 999,
                padding: "5px 14px",
              }}
            >
              <span className="fd" style={{ fontSize: 13, fontWeight: 800, color: T.green }}>
                {doneCount}/{totalCount}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <ProgressArc pct={pct} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {[
              [T.success, "Overall"],
              [T.yellow, "Learning"],
              [T.lav, "Personal"],
            ].map(([c, l]) => (
              <span
                key={l}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: c,
                    display: "inline-block",
                  }}
                />
                {l}
              </span>
            ))}
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Card bg={T.sage} p={20}>
            <IconBadge icon={Sparkles} bg="rgba(11,61,40,.15)" color={T.green} sz={15} p={8} />
            <p
              className="fd"
              style={{ margin: "14px 0 2px", fontSize: 38, fontWeight: 800, color: T.green, lineHeight: 1 }}
            >
              {todayLearned.length}
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.green, opacity: 0.65 }}>
              insights
              <br />
              today
            </p>
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 99,
                  background: T.green,
                  width: `${Math.min(todayLearned.length * 22, 100)}%`,
                  marginBottom: 6,
                }}
              />
              <div style={{ height: 4, borderRadius: 99, background: T.green, opacity: 0.12, width: "100%" }} />
            </div>
          </Card>

          <Card bg={T.green} p={20}>
            <IconBadge icon={Star} bg="rgba(237,216,0,.2)" color={T.yellow} sz={14} p={7} />
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: T.yellow,
                margin: "12px 0 6px",
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              {userName}&apos;s Tip
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", lineHeight: 1.55 }}>
              Review catatan sebelum tidur buat retensi lebih kuat!
            </p>
          </Card>
        </div>

        <Card>
          <SectionHeader icon={Target} ibg="#FFF3C4" icol={T.green} title="Today's Targets" />
          <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
            {data.targets.map((t) => (
              <div
                key={t.id}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 99,
                  background: t.done ? T.success : T.border,
                  transition: "background .3s",
                }}
              />
            ))}
          </div>

          {data.targets.slice(0, 3).map((t, i) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 0",
                borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: t.done ? T.success : "transparent",
                  border: `2.5px solid ${t.done ? T.success : T.border}`,
                }}
              >
                {t.done && <Check size={12} color="white" strokeWidth={3} />}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.done ? T.muted : T.text,
                  textDecoration: t.done ? "line-through" : "none",
                }}
              >
                {t.title}
              </span>
            </div>
          ))}

          <button
            onClick={() => onNavigate("learn")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              width: "100%",
              marginTop: 14,
              background: T.bg,
              border: "none",
              borderRadius: 12,
              padding: "10px 0",
              cursor: "pointer",
              color: T.green,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            See all targets <ChevronRight size={14} />
          </button>
        </Card>

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <IconBadge icon={CalendarDays} bg="#E8DCFF" color="#6B4FBB" sz={15} p={7} />
              <span className="fd" style={{ fontSize: 16, fontWeight: 800, color: T.green }}>
                Today&apos;s Schedule
              </span>
            </div>
            <button
              onClick={() => onNavigate("schedule")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: T.green,
              }}
            >
              See all <ChevronRight size={13} />
            </button>
          </div>

          {data.schedule.slice(0, 3).map((s, i) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: T.muted,
                  fontFamily: "monospace",
                  width: 38,
                  flexShrink: 0,
                  fontWeight: 600,
                }}
              >
                {s.time}
              </span>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  color: s.done ? T.muted : T.text,
                  textDecoration: s.done ? "line-through" : "none",
                }}
              >
                {s.title}
              </span>
              {s.done && (
                <div style={{ background: "#E8F7EF", borderRadius: 999, padding: "2px 9px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.success }}>Done</span>
                </div>
              )}
            </div>
          ))}
        </Card>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
};
