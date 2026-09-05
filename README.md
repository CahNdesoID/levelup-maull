# Level Up With Maul

Pelacak belajar harian: catatan bergrup, insight harian, target, dan jadwal —
semuanya jalan di browser tanpa backend.

React 18 · TypeScript (strict) · Vite 5 · lucide-react. Tanpa CSS framework;
styling pakai inline style dengan design token terpusat di
`src/constants/theme.ts`.

## Menjalankan

```bash
npm install
npm run dev        # dev server
npm run build      # typecheck (tsc -b) lalu build produksi
npm run typecheck  # typecheck saja
npm run lint       # eslint
npm run preview    # serve hasil build
```

## Struktur

```
src/
├── App.tsx                 shell navigasi — hanya view state
├── main.tsx                entry point
├── types/                  seluruh tipe domain (satu sumber kebenaran)
├── constants/
│   ├── theme.ts            design token + konstanta layout
│   └── seed.ts             data awal untuk instalasi baru
├── utils/
│   ├── id.ts               createId() — UUID v4
│   ├── date.ts             format & sorting tanggal
│   ├── storage.ts          wrapper localStorage yang melaporkan kegagalan
│   └── image.ts            downscale foto avatar
├── data/migrate.ts         normalisasi data lama → bentuk sekarang
├── sync/                   lapisan persistensi (local, Supabase, backup file)
├── hooks/useAppDataState.ts  seluruh state + mutasi data
├── store/                  context provider + useStore()
├── components/             komponen UI yang dipakai lintas layar
└── screens/                satu file per layar
    └── notes/              tiga sub-view dari tab Notes
```

Aturannya: **layar tidak pernah menyentuh `localStorage` atau adapter sync
langsung.** Semua lewat `useStore()`.

## Data & persistensi

Satu objek `AppData` menampung `groups`, `general`, `learned`, `targets`,
`schedule`, dan `bin`. Disimpan ke `localStorage` di key `lum_data`,
`lum_name`, dan `lum_avatar` setiap kali berubah.

Setiap entitas punya `id` bertipe string (UUID v4 dari `crypto.randomUUID()`,
dengan fallback untuk konteks non-secure seperti akses lewat IP LAN di http).

**Kompatibilitas data lama.** Versi sebelumnya memakai `Date.now()` sebagai id,
yang bertipe number, dan versi paling awal belum punya array `bin`.
`src/data/migrate.ts` menormalkan keduanya saat load — id numerik dipertahankan
nilainya (dikonversi ke string) supaya referensi antar-entitas tetap utuh, dan
entri yang tidak terbaca dibuang alih-alih bikin render crash.

Hapus item bersifat *soft delete*: item pindah ke `bin` dan bisa di-restore
selama 30 hari. Catatan: item kedaluwarsa hanya disembunyikan dari tampilan,
tidak otomatis dibuang dari storage — gunakan "Empty Bin" untuk benar-benar
membersihkan.

## Backup

Karena semua data cuma ada di satu browser, membersihkan cache = data hilang
permanen. Profile → **Backup & Data** menyediakan:

- **Export** — unduh seluruh data sebagai satu file JSON.
- **Import** — muat file backup. Ini **mengganti** semua data yang ada, dan
  meminta konfirmasi dulu.

## Cloud backup (opsional, Supabase)

Nonaktif secara default. Aplikasi jalan sepenuhnya offline kalau env var di
bawah tidak diisi. Diimplementasikan lewat REST API PostgREST dengan `fetch`
biasa, jadi tidak menambah dependency apa pun.

> **Belum diuji terhadap project Supabase sungguhan.** Belum ada project yang
> di-provision untuk repo ini, jadi adapter-nya baru terverifikasi lewat
> pembacaan kode. Uji end-to-end dulu sebelum menjadikannya satu-satunya backup.

### 1. Buat tabelnya

```sql
create table public.lum_snapshots (
  id         uuid primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.lum_snapshots enable row level security;

-- Akses baca/tulis hanya untuk baris yang id-nya sudah diketahui pemanggil.
create policy "snapshot access by id"
  on public.lum_snapshots
  for all
  using (true)
  with check (true);
```

### 2. Isi `.env`

```bash
cp .env.example .env
# isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, lalu build ulang
```

Tombol **Push** / **Pull** akan muncul di panel Backup & Data.

### ⚠️ Batas keamanannya — baca sebelum dipakai

Aplikasi ini tidak punya login, jadi tidak ada identitas user untuk membatasi
baris. Akses ditentukan murni oleh `snapshotId` — UUID acak yang disimpan di
localStorage browser ini dan dipakai sebagai id baris.

Artinya UUID itu adalah **bearer secret**: siapa pun yang mengetahuinya (plus
anon key, yang memang ikut ter-bundle dan terlihat publik) bisa membaca dan
menimpa baris tersebut. Policy di atas sengaja permisif karena tanpa auth tidak
ada yang bisa dijadikan dasar pembatasan.

Ini cukup untuk tracker pribadi lintas perangkat sendiri. Ini **tidak cukup**
untuk data sensitif atau penggunaan multi-user. Untuk itu, tambahkan Supabase
Auth lalu ubah policy-nya jadi berbasis `auth.uid()`.

## Keterbatasan yang diketahui

- **Tanggal tanpa tahun.** Entitas menyimpan label seperti `"17 May"` tanpa
  tahun, jadi `dateScore()` menganggap tanggal dari tahun berbeda sebagai tahun
  yang sama. Memperbaikinya butuh perubahan model data (menambah timestamp ISO),
  bukan sekadar refactor.
- **Swipe hanya untuk sentuhan.** Aksi swipe (kanan = hapus, kiri = edit) pakai
  touch event, jadi tidak jalan dengan mouse di desktop. Setiap aksinya masih
  bisa dijangkau lewat tombol lain.
- **Sync manual.** Push/pull dijalankan lewat tombol, bukan otomatis, supaya
  tidak membanjiri API di tiap ketikan. Tidak ada resolusi konflik — pull
  menimpa data lokal, push menimpa data remote.
