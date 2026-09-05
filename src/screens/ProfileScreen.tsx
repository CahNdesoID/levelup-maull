import { useState } from "react";
import { Award, BookOpen, CalendarDays, Camera, Layers, Pencil, Target, Trash2, Zap } from "lucide-react";
import { BackupPanel } from "../components/BackupPanel";
import { Card } from "../components/Card";
import { Hero } from "../components/Hero";
import { IconBadge } from "../components/IconBadge";
import { ProfileEditModal } from "../components/ProfileEditModal";
import { SectionHeader } from "../components/SectionHeader";
import { SwipeActions } from "../components/SwipeActions";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";
import { dateScore } from "../utils/date";
import { useStore } from "../store/context";
import type { EditTarget, LearnedItem, Preview } from "../types";

interface ProfileScreenProps {
  onOpenTrash: () => void;
  onPreview: (preview: Preview) => void;
  onEdit: (target: EditTarget) => void;
}

export const ProfileScreen = ({ onOpenTrash, onPreview, onEdit }: ProfileScreenProps) => {
  const {
    data,
    userName,
    avatar,
    allNotesCount,
    doneCount,
    totalCount,
    activeBin,
    setUserName,
    setAvatar,
    delLearned,
  } = useStore();

  const [editOpen, setEditOpen] = useState(false);

  // Learning log grouped by day, most recent first.
  const byDate = data.learned.reduce<Record<string, LearnedItem[]>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort((a, b) => dateScore(b) - dateScore(a));

  const stats = [
    { v: String(allNotesCount), l: "Total Notes", I: BookOpen, bg: T.sage },
    { v: String(data.groups.length), l: "Groups", I: Layers, bg: T.peach },
    { v: `${doneCount}/${totalCount}`, l: "Targets", I: Target, bg: T.lav },
  ];

  const avatarFace =
    avatar.type === "photo" && avatar.value ? (
      <img src={avatar.value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : avatar.type === "emoji" ? (
      <span style={{ fontSize: 32 }}>{avatar.value}</span>
    ) : (
      <span className="fd" style={{ fontSize: 30, fontWeight: 800, color: T.green }}>
        {userName.charAt(0).toUpperCase()}
      </span>
    );

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Hero pt={52}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
            onClick={() => setEditOpen(true)}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                overflow: "hidden",
                background: `linear-gradient(135deg,${T.yellow},#F5A800)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(237,216,0,.4)",
              }}
            >
              {avatarFace}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -3,
                right: -3,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: T.green,
                border: "2px solid rgba(255,255,255,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={11} color="white" />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 className="fd" style={{ color: "white", fontSize: 28, fontWeight: 800 }}>
                {userName}
              </h1>
              <button
                onClick={() => setEditOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(255,255,255,.12)",
                  border: "none",
                  borderRadius: 999,
                  padding: "5px 12px",
                  cursor: "pointer",
                }}
              >
                <Pencil size={12} color="white" />
                <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>Edit</span>
              </button>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: T.yellow,
                borderRadius: 999,
                padding: "4px 12px",
                marginTop: 8,
              }}
            >
              <Zap size={12} color={T.green} strokeWidth={2.5} />
              <span className="fd" style={{ fontSize: 12, fontWeight: 800, color: T.green }}>
                Level Up With Maul
              </span>
            </div>
          </div>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {stats.map(({ v, l, I, bg }) => (
            <Card key={l} bg={bg} p={18}>
              <IconBadge icon={I} bg="rgba(11,61,40,.12)" color={T.green} sz={16} p={7} />
              <p
                className="fd"
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: T.green,
                  margin: "10px 0 2px",
                  lineHeight: 1,
                }}
              >
                {v}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.green, opacity: 0.6 }}>{l}</p>
            </Card>
          ))}
        </div>

        <Card>
          <SectionHeader
            icon={BookOpen}
            ibg="rgba(168,212,188,.3)"
            icol={T.green}
            title="Learning Log"
          />
          {dates.length === 0 && (
            <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>
              No learning history yet.
            </p>
          )}

          {dates.map((date, di) => (
            <div key={date} style={{ marginBottom: di < dates.length - 1 ? 22 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <div
                  style={{
                    background: T.bg,
                    borderRadius: 999,
                    padding: "3px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <CalendarDays size={11} color={T.muted} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.muted }}>{date}</span>
                </div>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>

              {byDate[date].map((item, i) => (
                <SwipeActions
                  key={item.id}
                  onDelete={() => delLearned(item.id)}
                  onEdit={() => onEdit({ type: "learned", id: item.id, text: item.text })}
                >
                  <div
                    onClick={() => onPreview({ type: "learned", text: item.text, date: item.date })}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 0",
                      cursor: "pointer",
                      borderBottom:
                        i < byDate[date].length - 1 ? `1px solid ${T.border}` : "none",
                      background: T.surf,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: T.success,
                        flexShrink: 0,
                        marginTop: 8,
                      }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#444",
                        lineHeight: 1.7,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                </SwipeActions>
              ))}
            </div>
          ))}
        </Card>

        <BackupPanel />

        <button
          onClick={onOpenTrash}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            background: "none",
            border: `1.5px solid ${T.border}`,
            borderRadius: 16,
            padding: "14px 0",
            cursor: "pointer",
          }}
        >
          <Trash2 size={15} color={T.muted} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>
            Trash{activeBin.length > 0 ? ` (${activeBin.length})` : ""}
          </span>
        </button>

        <Card bg={T.green} p={24}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: T.yellow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Award size={24} color={T.green} strokeWidth={2} />
            </div>
            <div>
              <p className="fd" style={{ fontSize: 18, fontWeight: 800, color: T.yellow }}>
                Keep Going! 💪
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.55)",
                  marginTop: 4,
                  lineHeight: 1.6,
                }}
              >
                You&apos;re on a roll. One insight at a time.
              </p>
            </div>
          </div>
        </Card>

        <div style={{ height: 8 }} />
      </div>

      {editOpen && (
        <ProfileEditModal
          onClose={() => setEditOpen(false)}
          userName={userName}
          avatar={avatar}
          onSave={(name, nextAvatar) => {
            setUserName(name);
            setAvatar(nextAvatar);
          }}
        />
      )}
    </div>
  );
};
