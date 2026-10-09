# Sistem Form Permintaan Barang

Aplikasi **Laravel 12 + React + TypeScript + Inertia.js** untuk membuat, mengajukan,
dan mencetak **Form Permintaan Barang (FPB)** per salesman/branch dalam format form
fisik, dilengkapi manajemen produk (katalog Mayora), manajemen user, dan activity log.

---

## ✨ Fitur

- **Autentikasi & Otorisasi**
  - Login/logout (registrasi publik dimatikan).
  - Dua peran (role): **Admin** dan **Sales**.
  - Akun nonaktif (`is_active = false`) tidak dapat login.
  - Pencatatan `last_login_at` dan activity log saat login/logout.
- **Form Permintaan Barang (FPB)**
  - Nomor FPB otomatis dengan format `FPB-YYYYMM-XXXX`.
  - Header: Branch, Subbranch, Nama Salesman, Tanggal, RYN, No. Kendaraan.
  - Kolom **branch/subbranch/salesman** diambil otomatis dari data user (snapshot).
  - Tabel 15 baris dengan kolom **DIMINTA** terbagi menjadi `KTN`, `RCG`, `BKS`
    (disimpan terpisah, tidak dijumlahkan menjadi satu kuantitas).
  - Baris **TOTAL** per segmen dan konversi **TERBILANG** (angka ke huruf).
  - Tiga blok tanda tangan: Disetujui Oleh, Diperiksa Oleh, Diminta Oleh.
  - Alur status: `DRAFT → SUBMITTED → APPROVED`, serta `CANCELLED`.
  - Cetak PDF A4 portrait dengan 15 baris tetap.
- **Master Data**
  - **Products**: katalog produk (mis. Mayora) dengan kategori, unit, dan kode
    otomatis `PRD-XXXX`.
  - **Users**: kelola akun Admin/Sales, branch/subbranch, reset password.
- **Activity Log**
  - Mencatat aksi login/logout, create/update/delete produk, pembuatan &
    perubahan status FPB, dan cetak FPB.
- **Dashboard**
  - Admin: statistik global FPB (draft, menunggu review, disetujui, dibatalkan),
    tren bulanan, FPB per sales, dan produk terbanyak diminta.
  - Sales: statistik FPB miliknya sendiri.
- **Keamanan**
  - Isolasi data: Sales hanya dapat melihat/mengubah FPB miliknya.
  - Policy (otorisasi) pada setiap aksi FPB, produk, dan user.
  - Validasi server-side menyeluruh (Form Request).

---

## 🧱 Tech Stack

| Layer      | Teknologi                                                 |
| ---------- | --------------------------------------------------------- |
| Backend    | Laravel 12.69.3 (PHP 8.2+)                                |
| Frontend   | React 18 + TypeScript 5 + Inertia.js 2 + Tailwind CSS 3   |
| Build      | Vite 6                                                    |
| Auth       | Laravel Breeze (React)                                    |
| PDF        | barryvdh/laravel-dompdf                                   |
| Icons      | lucide-react                                              |
| Routing FE | Ziggy (`route()` helper)                                  |
| Database   | MySQL / MariaDB                                           |

---

## ✅ Kebutuhan

- PHP **>= 8.2** dengan ekstensi: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `gd` (untuk DomPDF).
- Composer 2.x
- Node.js 18+ & npm
- MySQL 8 / MariaDB 10.4+

---

## 🚀 Instalasi

1. **Clone / masuk ke direktori proyek**

   ```bash
   cd Form_PO
   ```

2. **Install dependensi PHP & JS**

   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi environment**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Sesuaikan koneksi database dan profil perusahaan pada `.env`:

   ```env
   APP_NAME="Sistem Form Permintaan Barang"
   APP_URL=http://localhost

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=form_po
   DB_USERNAME=root
   DB_PASSWORD=

   COMPANY_NAME="PT. CIPTA NIAGA SEMESTA"
   COMPANY_ADDRESS="Jl. Jenderal Sudirman No. 1, Jakarta"
   COMPANY_PHONE="+62 21 1234 5678"
   COMPANY_EMAIL="info@formpo.test"
   ```

4. **Buat database & migrasi + seed**

   ```bash
   # buat database terlebih dahulu, mis.:
   # mysql -u root -e "CREATE DATABASE form_po CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

   php artisan migrate --seed
   ```

   Untuk mengulang dari awal:

   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Build asset / jalankan dev server**

   ```bash
   # produksi
   npm run build

   # atau mode development (hot reload)
   npm run dev
   ```

6. **Jalankan aplikasi**

   ```bash
   php artisan serve
   ```

   Buka `http://localhost:8000`.

---

## 🔑 Akun Default (Seeder)

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| Admin | `admin@formpo.test` | `password` |
| Sales | `sales@formpo.test` | `password` |

Seeder juga membuat beberapa sales tambahan, katalog produk, dan FPB demo.

---

## 📝 Alur Status Form Permintaan Barang (FPB)

```
   create ─▶ DRAFT ──submit──▶ SUBMITTED ──approve──▶ APPROVED
                │                   │
                └──── cancel ───────┴──▶ CANCELLED
```

- Hanya FPB berstatus **DRAFT** yang dapat diedit.
- Sales mengajukan FPB miliknya; Admin menyetujui FPB yang berstatus `SUBMITTED`.
- Saat diajukan, kolom **DIMINTA OLEH** otomatis terisi nama salesman.

---

## 👥 Hak Akses

| Fitur                     | Admin | Sales       |
| ------------------------- | :---: | :---------: |
| Dashboard                 |  ✅   | ✅ (miliknya) |
| Lihat / buat FPB          |  ✅   | ✅ (miliknya) |
| Ajukan / batalkan FPB     |  ✅   | ✅ (miliknya) |
| Setujui FPB (approve)     |  ✅   | ❌          |
| Cetak FPB (PDF)           |  ✅   | ✅ (miliknya) |
| Master Product            |  ✅   | ❌          |
| Manajemen User            |  ✅   | ❌          |
| Activity Log              |  ✅   | ❌          |

---

## 🧪 Testing

Test menggunakan SQLite in-memory (lihat `phpunit.xml`) sehingga tidak mengganggu
database pengembangan.

```bash
php artisan test
```

Cakupan test meliputi:

- Autentikasi & blokir akun nonaktif (`tests/Feature/Auth`).
- Alur lengkap Form Permintaan Barang (`GoodsRequestWorkflowTest`).
- Isolasi data & otorisasi role (`GoodsRequestAccessTest`, `MasterDataAccessTest`).
- Konversi angka ke terbilang (`tests/Unit/TerbilangServiceTest`).

---

## 📁 Struktur Proyek (ringkas)

```
app/
├── Enums/                 GoodsRequestStatus, UserRole
├── Http/
│   ├── Controllers/       Dashboard, GoodsRequest, Product, User, ActivityLog
│   ├── Middleware/        EnsureUserHasRole (alias: role)
│   └── Requests/          Validasi Form Request
├── Models/                User, Product, GoodsRequest, GoodsRequestItem, ActivityLog
├── Policies/              Otorisasi FPB, Product, User
└── Services/              FPB Number, GoodsRequest, Terbilang, ActivityLog
resources/js/
├── Components/            UI kit, FpbStatusBadge, Pagination, StatCard, Charts, dll.
├── Layouts/               AuthenticatedLayout, GuestLayout
├── Pages/                 Dashboard, GoodsRequests, Products, Users, ActivityLogs
└── types/                 Definisi tipe TypeScript
resources/views/pdf/       Template PDF FPB
database/
├── migrations/            Skema tabel
├── factories/             User, Product
└── seeders/               Data awal
routes/
├── web.php                Rute aplikasi
└── auth.php               Rute autentikasi
```

---

## 🗒️ Catatan

- Nomor FPB dibuat di `GoodsRequestNumberService` dengan pengecekan keunikan per bulan.
- Query tren bulanan pada dashboard portabel terhadap MySQL/MariaDB, PostgreSQL, dan SQLite.
- Registrasi publik (`/register`) dinonaktifkan; user dibuat oleh Admin melalui menu **Users**.
- **FPB**: kolom `branch`/`subbranch` ditambahkan pada tabel `users` dan
  disalin (snapshot) ke header FPB saat dibuat, sehingga data dokumen lama tidak
  berubah bila master user diubah.
- **FPB**: ketiga nilai DIMINTA (`qty_ktn`, `qty_rcg`, `qty_bks`) disimpan sebagai
  kolom terpisah dan **tidak** dijumlahkan menjadi satu kuantitas; baris TOTAL
  hanya menjumlahkan antar baris per segmen.
- Orientasi PDF FPB adalah **A4 portrait** dengan 15 baris tetap; baris kosong
  tetap ditampilkan agar format dokumen konsisten.
- Katalog produk awal (Mayora) di-seed melalui `ProductSeeder`; setiap varian
  disimpan sebagai satu baris produk dengan `category`.
