# SigapTugas

Sistem Manajemen Tugas untuk Siswa dan Guru dengan integrasi Supabase.

## Struktur Folder

```
SigapTugas/
├── public/
│   ├── index.html      # Halaman Landing & Login
│   ├── dashboard.html  # Halaman Dashboard Tugas
│   └── script.js       # Logika Frontend & Supabase
├── server.js           # Express Backend
├── .env                # Konfigurasi API
├── package.json        # Dependensi NPM
└── README.md           # Dokumentasi
```

## Fitur

- **Login Siswa**: Lihat dan kumpulkan tugas
- **Login Guru**: Kelola tugas (tambah, edit, hapus)
- **Integrasi Supabase**: Database real-time
- **Desain Responsif**: Tailwind CSS dengan tema Biru Navy & Emerald

## Cara Menjalankan

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan server:
   ```bash
   npm start
   ```

3. Buka browser: `http://localhost:3000`

## Konfigurasi Supabase

Pastikan tabel `tasks` sudah dibuat di Supabase dengan schema:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_name TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  is_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Contoh Data

```sql
INSERT INTO tasks (teacher_name, description, deadline, is_submitted)
VALUES 
('Bpk. Budi', 'Tugas Matematika: Aljabar Linear', '2026-03-15', false),
('Ibu Siti', 'Laporan Praktikum Biologi', '2026-03-12', true);
```


