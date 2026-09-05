import { useState } from "react";
import { BookOpen, Check, CheckSquare, Sparkles } from "lucide-react";
import { Card } from "../components/Card";
import { Hero } from "../components/Hero";
import { IconBadge } from "../components/IconBadge";
import { Modal } from "../components/Modal";
import { SectionHeader } from "../components/SectionHeader";
import { SwipeActions } from "../components/SwipeActions";
import { ButtonRow, TextArea, TextInput } from "../components/FormControls";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";
import { useStore } from "../store/context";
import type { EditTarget, Preview } from "../types";

interface LearnScreenProps {
  onPreview: (preview: Preview) => void;
  onEdit: (target: EditTarget) => void;
}

export const LearnScreen = ({ onPreview, onEdit }: LearnScreenProps) => {
  const {
    data,
    todayLearned,
    doneCount,
    totalCount,
    pct,
    addLearn,
    addTarget,
    delLearned,
    delTarget,
    toggleTarget,
  } = useStore();

  const [modal, setModal] = useState<"learn" | "target" | null>(null);
  const [learnDraft, setLearnDraft] = useState("");
  const [targetDraft, setTargetDraft] = useState("");

  const submitLearn = () => {
    if (!addLearn(learnDraft)) return;
    setLearnDraft("");
    setModal(null);
  };

  const submitTarget = () => {
    if (!addTarget(targetDraft)) return;
    setTargetDraft("");
    setModal(null);
  };

  const stats = [
    { I: Sparkles, v: String(todayLearned.length), l: "Today", bg: T.sage },
    { I: BookOpen, v: String(data.learned.length), l: "All-time", bg: T.lav },
    { I: CheckSquare, v: `${doneCount}/${totalCount}`, l: "Targets", bg: T.peach },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Hero>
        <h1
          className="fd"
          style={{ color: "white", fontSize: 40, fontWeight: 800, letterSpacing: "-.02em" }}
        >
          LEARN LOG
        </h1>
        <p style={{ color: T.sage, fontSize: 12, marginTop: 6 }}>
          Track what you learn every day
        </p>
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
          <SectionHeader
            icon={Sparkles}
            ibg="rgba(168,212,188,.25)"
            icol={T.green}
            title="What I Learned Today"
            btnLabel="Add"
            onBtn={() => setModal("learn")}
          />

          {todayLearned.length === 0 && (
            <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>
              Nothing yet — add your first insight!
            </p>
          )}

          {todayLearned.map((item, i) => (
            <SwipeActions
              key={item.id}
              onDelete={() => delLearned(item.id)}
              onEdit={() => onEdit({ type: "learned", id: item.id, text: item.text })}
            >
              <div
                onClick={() => onPreview({ type: "learned", text: item.text, date: item.date })}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 0",
                  cursor: "pointer",
                  borderBottom:
                    i < todayLearned.length - 1 ? `1px solid ${T.border}` : "none",
                  background: T.surf,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: T.yellow,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <span className="fd" style={{ fontSize: 12, fontWeight: 800, color: T.green }}>
                    {i + 1}
                  </span>
                </div>
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
        </Card>

        <Card>
          <SectionHeader
            icon={CheckSquare}
            ibg="#FFF3C4"
            icol={T.green}
            title="Daily Targets"
            btnLabel="Add"
            onBtn={() => setModal("target")}
          />

          <div style={{ background: T.bg, borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>Progress</span>
              <span className="fd" style={{ fontSize: 12, fontWeight: 800, color: T.green }}>
                {doneCount}/{totalCount} · {pct}%
              </span>
            </div>
            <div style={{ background: "white", borderRadius: 99, height: 10, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: T.success,
                  width: `${pct}%`,
                  transition: "width .5s ease",
                }}
              />
            </div>
          </div>

          {data.targets.length === 0 && (
            <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "16px 0" }}>
              Belum ada target. Tambah satu buat mulai.
            </p>
          )}

          {data.targets.map((t, i) => (
            <SwipeActions
              key={t.id}
              onDelete={() => delTarget(t.id)}
              onEdit={() => onEdit({ type: "target", id: t.id, title: t.title })}
            >
              <div
                onClick={() => toggleTarget(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 0",
                  cursor: "pointer",
                  borderBottom: i < data.targets.length - 1 ? `1px solid ${T.border}` : "none",
                  background: T.surf,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: t.done ? T.success : "transparent",
                    border: `2.5px solid ${t.done ? T.success : T.border}`,
                    transition: "all .2s",
                  }}
                >
                  {t.done && <Check size={13} color="white" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: t.done ? T.muted : T.text,
                    textDecoration: t.done ? "line-through" : "none",
                    transition: "all .2s",
                  }}
                >
                  {t.title}
                </span>
              </div>
            </SwipeActions>
          ))}
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {stats.map(({ I, v, l, bg }) => (
            <Card key={l} bg={bg} p={16}>
              <IconBadge icon={I} bg="rgba(11,61,40,.12)" color={T.green} sz={14} p={6} />
              <p
                className="fd"
                style={{ fontSize: 26, fontWeight: 800, color: T.green, margin: "10px 0 2px" }}
              >
                {v}
              </p>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.green, opacity: 0.6 }}>{l}</p>
            </Card>
          ))}
        </div>

        <div style={{ height: 8 }} />
      </div>

      <Modal show={modal === "learn"} onClose={() => setModal(null)} title="What did you learn?">
        <TextArea
          ph="Tulis insight atau hal baru yang kamu pelajari hari ini..."
          val={learnDraft}
          chg={(e) => setLearnDraft(e.target.value)}
        />
        <ButtonRow onCancel={() => setModal(null)} onSave={submitLearn} label="Save Insight" />
      </Modal>

      <Modal show={modal === "target"} onClose={() => setModal(null)} title="New Daily Target">
        <TextInput
          ph="e.g. Baca 10 halaman buku..."
          val={targetDraft}
          chg={(e) => setTargetDraft(e.target.value)}
        />
        <ButtonRow onCancel={() => setModal(null)} onSave={submitTarget} label="Add Target" />
      </Modal>
    </div>
  );
};
