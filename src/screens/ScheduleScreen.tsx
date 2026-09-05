import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../components/Card";
import { Hero } from "../components/Hero";
import { Modal } from "../components/Modal";
import { SwipeActions } from "../components/SwipeActions";
import { ButtonRow, TextInput } from "../components/FormControls";
import { MAX_CONTENT_WIDTH, T } from "../constants/theme";
import { schedDate } from "../utils/date";
import { useStore } from "../store/context";
import type { EditTarget } from "../types";

export const ScheduleScreen = ({ onEdit }: { onEdit: (target: EditTarget) => void }) => {
  const { data, addSched, delSched, toggleSched } = useStore();

  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const submit = () => {
    if (!addSched(time, title, desc)) return;
    setTime("");
    setTitle("");
    setDesc("");
    setOpen(false);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <Hero>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1
              className="fd"
              style={{ color: "white", fontSize: 40, fontWeight: 800, letterSpacing: "-.02em" }}
            >
              SCHEDULE
            </h1>
            <p style={{ color: T.sage, fontSize: 12, marginTop: 6 }}>{schedDate()}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: T.yellow,
              border: "none",
              borderRadius: 999,
              padding: "8px 16px",
              cursor: "pointer",
              color: T.green,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </Hero>

      <div style={{ padding: "20px 16px", maxWidth: MAX_CONTENT_WIDTH, margin: "0 auto" }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 54,
              top: 8,
              bottom: 8,
              width: 2,
              background: T.border,
              borderRadius: 1,
            }}
          />

          {data.schedule.length === 0 && (
            <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: "40px 0" }}>
              Belum ada jadwal. Tap Add buat bikin yang pertama.
            </p>
          )}

          {data.schedule.map((s) => (
            <div key={s.id} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <span
                style={{
                  width: 42,
                  flexShrink: 0,
                  fontSize: 11,
                  color: T.muted,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  paddingTop: 14,
                  textAlign: "right",
                }}
              >
                {s.time}
              </span>
              <div style={{ position: "relative", zIndex: 1, flexShrink: 0, paddingTop: 13 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: s.done ? T.success : s.color,
                    border: "2.5px solid white",
                    boxShadow: `0 0 0 2px ${T.border}`,
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <SwipeActions
                  radius={18}
                  onDelete={() => delSched(s.id)}
                  onEdit={() =>
                    onEdit({
                      type: "sched",
                      id: s.id,
                      time: s.time,
                      title: s.title,
                      desc: s.desc,
                    })
                  }
                >
                  <div onClick={() => toggleSched(s.id)} style={{ cursor: "pointer" }}>
                    <Card
                      bg={s.done ? "#F5F0E8" : s.color}
                      p={14}
                      style={{ borderRadius: 18, boxShadow: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p
                            className="fd"
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: s.done ? T.muted : T.green,
                              textDecoration: s.done ? "line-through" : "none",
                            }}
                          >
                            {s.title}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: s.done ? T.muted : T.green,
                              opacity: 0.7,
                              marginTop: 2,
                            }}
                          >
                            {s.desc}
                          </p>
                        </div>
                        <div
                          style={{
                            background: s.done ? "#E8F7EF" : "rgba(11,61,40,.1)",
                            borderRadius: 999,
                            padding: "3px 10px",
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: s.done ? T.success : T.green,
                            }}
                          >
                            {s.done ? "Done" : "Tap"}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </SwipeActions>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 8 }} />
      </div>

      <Modal show={open} onClose={() => setOpen(false)} title="New Activity">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput ph="Time (e.g. 08:00)" val={time} chg={(e) => setTime(e.target.value)} />
          <TextInput ph="Activity title..." val={title} chg={(e) => setTitle(e.target.value)} />
          <TextInput
            ph="Short description (optional)..."
            val={desc}
            chg={(e) => setDesc(e.target.value)}
          />
          <ButtonRow onCancel={() => setOpen(false)} onSave={submit} label="Add Activity" />
        </div>
      </Modal>
    </div>
  );
};
