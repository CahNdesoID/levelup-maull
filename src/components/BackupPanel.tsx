import { useRef, useState } from "react";
import { CloudDownload, CloudUpload, Download, ShieldCheck, Upload } from "lucide-react";
import { Card } from "./Card";
import { SectionHeader } from "./SectionHeader";
import { T } from "../constants/theme";
import { exportBackup, parseBackup } from "../sync/backup";
import { useStore } from "../store/context";

const actionButton = (accent: boolean) =>
  ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    background: accent ? T.green : "none",
    color: accent ? "white" : T.green,
    border: accent ? "none" : `1.5px solid ${T.border}`,
    borderRadius: 14,
    padding: accent ? "12px 0" : "10.5px 0",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  }) as const;

/**
 * Data-safety controls.
 *
 * Everything the app knows lives in one browser's localStorage, so clearing
 * site data destroys it. A JSON export is the one recovery path that needs no
 * account and no network; the remote buttons only appear when a Supabase
 * project has been configured at build time.
 */
export const BackupPanel = () => {
  const { snapshot, replaceSnapshot, isRemoteEnabled, syncState, pushToRemote, pullFromRemote } =
    useStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleImport = async (file: File) => {
    try {
      const imported = await parseBackup(file);
      const counts = imported.data;
      const confirmed = window.confirm(
        `Import akan MENGGANTI semua data saat ini dengan isi backup ` +
          `(${counts.groups.length} grup, ${counts.general.length} catatan umum, ` +
          `${counts.learned.length} insight, ${counts.targets.length} target, ` +
          `${counts.schedule.length} jadwal). Lanjutkan?`,
      );
      if (!confirmed) return;
      replaceSnapshot(imported);
      setNotice("Backup berhasil diimpor.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal membaca file backup.");
    }
  };

  const syncLabel = (): string => {
    switch (syncState.status) {
      case "syncing":
        return "Menyinkronkan…";
      case "synced":
        return `Tersinkron ${new Date(syncState.at).toLocaleTimeString()}`;
      case "error":
        return syncState.message;
      case "idle":
        return "Belum disinkronkan sesi ini.";
    }
  };

  return (
    <Card>
      <SectionHeader
        icon={ShieldCheck}
        ibg="rgba(168,212,188,.3)"
        icol={T.green}
        title="Backup & Data"
      />

      <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 14 }}>
        Semua data cuma tersimpan di browser ini. Kalau cache dibersihkan, datanya hilang —
        simpan file backup secara berkala.
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => exportBackup(snapshot)} style={actionButton(true)}>
          <Download size={15} /> Export
        </button>
        <button onClick={() => fileRef.current?.click()} style={actionButton(false)}>
          <Upload size={15} /> Import
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset first so picking the same file twice still fires onChange.
          e.target.value = "";
          if (file) void handleImport(file);
        }}
      />

      {isRemoteEnabled && (
        <>
          <div style={{ height: 1, background: T.border, margin: "18px 0 14px" }} />
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: T.muted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              marginBottom: 10,
            }}
          >
            Cloud backup
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => void pushToRemote()}
              disabled={syncState.status === "syncing"}
              style={actionButton(true)}
            >
              <CloudUpload size={15} /> Push
            </button>
            <button
              onClick={() => void pullFromRemote()}
              disabled={syncState.status === "syncing"}
              style={actionButton(false)}
            >
              <CloudDownload size={15} /> Pull
            </button>
          </div>
          <p
            style={{
              fontSize: 11,
              marginTop: 10,
              lineHeight: 1.5,
              color: syncState.status === "error" ? T.red : T.muted,
            }}
          >
            {syncLabel()}
          </p>
        </>
      )}

      {notice && (
        <p style={{ fontSize: 12, color: T.green, fontWeight: 600, marginTop: 12, lineHeight: 1.5 }}>
          {notice}
        </p>
      )}
    </Card>
  );
};
