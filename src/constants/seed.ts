import { T } from "./theme";
import { daysAgoLabel, todayLabel } from "../utils/date";
import type { AppData } from "../types";

/**
 * Starter content for a fresh install.
 *
 * Built by a factory rather than a shared constant so that (a) the sample dates
 * are relative to whenever the app is first opened instead of frozen to May
 * 2026, and (b) nothing can accidentally mutate a module-level object that a
 * later reset would hand out again.
 */
export const createSeedData = (): AppData => {
  const today = todayLabel();
  const d1 = daysAgoLabel(1);
  const d2 = daysAgoLabel(2);
  const d3 = daysAgoLabel(3);

  return {
    groups: [
      {
        id: "seed-group-html",
        name: "Belajar HTML",
        emoji: "🌐",
        color: T.sage,
        notes: [
          {
            id: "seed-note-html-1",
            title: "HTML Part 1",
            body: "Tag dasar: html, head, body, p, h1–h6. Semantic: article, section, nav.",
            date: today,
          },
          {
            id: "seed-note-html-2",
            title: "HTML Part 2",
            body: "Form: input, textarea, button. Atribut: action, method, placeholder.",
            date: today,
          },
        ],
      },
      {
        id: "seed-group-css",
        name: "Belajar CSS",
        emoji: "🎨",
        color: T.peach,
        notes: [
          {
            id: "seed-note-css-1",
            title: "Flexbox",
            body: "justify-content, align-items, flex-direction, flex-wrap, gap.",
            date: d1,
          },
          {
            id: "seed-note-css-2",
            title: "CSS Grid",
            body: "grid-template-columns, grid-template-rows, place-items, gap.",
            date: d2,
          },
        ],
      },
      {
        id: "seed-group-js",
        name: "Belajar JavaScript",
        emoji: "⚡",
        color: T.lav,
        notes: [
          {
            id: "seed-note-js-1",
            title: "Array Methods",
            body: "map, filter, reduce, forEach, find, some, every.",
            date: d3,
          },
        ],
      },
    ],
    general: [
      {
        id: "seed-general-1",
        title: "Ilmu Baru Hari Ini",
        body: "async/await adalah syntactic sugar di atas Promise. Event loop JS itu single-threaded tapi non-blocking.",
        date: today,
      },
      {
        id: "seed-general-2",
        title: "Motivasi",
        body: "30 menit per hari selama setahun = 182 jam. Konsistensi mengalahkan intensitas.",
        date: d1,
      },
    ],
    learned: [
      { id: "seed-learn-1", text: "Memahami semantic HTML dan pentingnya buat aksesibilitas", date: today },
      { id: "seed-learn-2", text: "Git commit message yang baik: imperative mood, max 72 karakter", date: today },
      { id: "seed-learn-3", text: "Feynman Technique: jelaskan konsep seolah ke anak kecil", date: today },
      { id: "seed-learn-4", text: "Async/await dan hubungannya dengan Promise chain", date: d1 },
      { id: "seed-learn-5", text: "CSS specificity: inline > id > class > element", date: d2 },
      { id: "seed-learn-6", text: "Array methods map, filter, reduce dengan contoh nyata", date: d3 },
    ],
    targets: [
      { id: "seed-target-1", title: "Baca 10 halaman buku", done: true },
      { id: "seed-target-2", title: "Latihan coding 1 jam", done: true },
      { id: "seed-target-3", title: "Review catatan kemarin", done: false },
      { id: "seed-target-4", title: "Tulis 1 insight baru", done: false },
      { id: "seed-target-5", title: "Nonton 1 video tutorial", done: false },
    ],
    schedule: [
      { id: "seed-sched-1", time: "06:00", title: "Morning Routine", desc: "Olahraga & meditasi", color: T.sage, done: true },
      { id: "seed-sched-2", time: "07:30", title: "Baca Buku", desc: "Atomic Habits – Bab 5", color: "#FFD6A5", done: true },
      { id: "seed-sched-3", time: "09:00", title: "Belajar HTML/CSS", desc: "Lanjut materi Flexbox & Grid", color: T.peach, done: false },
      { id: "seed-sched-4", time: "12:00", title: "Break & Makan", desc: "Istirahat penuh, no gadget", color: T.sky, done: false },
      { id: "seed-sched-5", time: "13:00", title: "Latihan Project", desc: "Build landing page", color: T.sage, done: false },
      { id: "seed-sched-6", time: "16:00", title: "Review & Catat", desc: "Tulis semua insight hari ini", color: T.yellow, done: false },
      { id: "seed-sched-7", time: "20:00", title: "Free Learning", desc: "YouTube / Podcast tech", color: T.lav, done: false },
    ],
    bin: [],
  };
};

export const STORAGE_KEYS = {
  data: "lum_data",
  name: "lum_name",
  avatar: "lum_avatar",
} as const;

export const DEFAULT_USER_NAME = "Maul";
