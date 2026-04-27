# 🌱 Prediksi Kelembaban Tanah untuk Pertanian Cerdas
### Tugas Gabungan — Modul IoT + Machine Learning

![Platform](https://img.shields.io/badge/Platform-ESP32--S3-blue)
![Backend](https://img.shields.io/badge/Backend-NestJS-red)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![ML](https://img.shields.io/badge/ML%20Server-FastAPI-green)
![Database](https://img.shields.io/badge/Database-MySQL-orange)
![Cloud](https://img.shields.io/badge/Deploy-Railway-purple)

---

## 📋 Deskripsi Proyek

**CaAs Agriculture** adalah sistem pertanian cerdas (*smart farming*) berbasis IoT dan Machine Learning yang dirancang untuk membantu petani memantau kondisi tanah dan mendapatkan rekomendasi penyiraman tanaman secara otomatis dan real-time.

Sistem ini mengintegrasikan **sensor fisik** pada mikrokontroler ESP32-S3 dengan **cloud backend** dan **dashboard web interaktif**, sehingga petani dapat memantau kebun mereka dari mana saja.

### Fitur Utama

- 📡 **Pengumpulan Data Real-Time** — Sensor soil moisture dan DHT11 membaca kondisi tanah dan cuaca setiap 10 detik
- 🤖 **Prediksi AI Ganda (Lokal + Cloud)** — Model Random Forest berjalan langsung di ESP32-S3 (*on-device inference*) dan juga tersedia via API cloud (FastAPI)
- 📊 **Dashboard Web** — Visualisasi data sensor, riwayat pembacaan, dan notifikasi penyiraman
- 🔔 **Sistem Notifikasi** — Notifikasi otomatis kapan waktu optimal untuk menyiram tanaman
- 🔐 **Autentikasi** — Sistem login/register dengan JWT untuk keamanan data

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        HARDWARE LAYER                        │
│                                                             │
│   ┌──────────────┐    ┌──────────┐    ┌─────────────────┐  │
│   │   DHT11      │    │  Soil    │    │   ESP32-S3      │  │
│   │ (Suhu + Hum) │───▶│ Moisture │───▶│  DevKitC-1      │  │
│   └──────────────┘    └──────────┘    │  + Random Forest│  │
│                                       │    (On-Device)  │  │
│                                       └────────┬────────┘  │
└────────────────────────────────────────────────│────────────┘
                                                 │ HTTP POST (JSON)
                                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                        CLOUD LAYER (Railway)                │
│                                                             │
│   ┌───────────────────┐         ┌──────────────────────┐   │
│   │   NestJS Backend  │────────▶│  FastAPI ML Server   │   │
│   │   (REST API)      │◀────────│  (model_farming.pkl) │   │
│   └────────┬──────────┘         └──────────────────────┘   │
│            │                                                │
│   ┌────────▼──────────┐                                    │
│   │   MySQL Database  │                                    │
│   │  (Docker / Cloud) │                                    │
│   └───────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│                                                             │
│            React + Vite — Dashboard Web                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│   │Dashboard │ │ Riwayat  │ │ Prediksi │ │  Notifikasi │  │
│   └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

| Komponen | Teknologi |
|---|---|
| Mikrokontroler | ESP32-S3 DevKitC-1 |
| Sensor | DHT11 (suhu & kelembaban udara), Soil Moisture Analog |
| Firmware | Arduino / PlatformIO (C++) |
| On-Device ML | Eloquent ML — Random Forest (C++ port) |
| Backend API | NestJS (TypeScript), TypeORM |
| ML Server | FastAPI (Python), scikit-learn, joblib |
| Frontend | React 19, Vite, React Router DOM |
| Database | MySQL 8.0 |
| Containerisasi | Docker & Docker Compose |
| Cloud Deploy | Railway |

---

## 📂 Struktur Proyek

```
CaAs-Agriculture/
│
├── 📁 firmware/                        # Kode ESP32-S3 (PlatformIO)
│   ├── src/
│   │   └── main.cpp                   # Program utama ESP32-S3
│   ├── include/
│   │   └── model_local.h              # Model Random Forest (C++ port)
│   └── platformio.ini                 # Konfigurasi board & library
│
├── 📁 Project Smart Farming/           # ML Server (FastAPI/Python)
│   ├── main2.py                       # Endpoint FastAPI (/predict)
│   ├── model_farming.pkl              # Model terlatih (scikit-learn)
│   ├── requirements.txt               # Dependensi Python
│   └── Procfile                       # Konfigurasi deploy Railway
│
├── 📁 backend/                         # Backend API (NestJS)
│   ├── src/
│   │   ├── sensor/                    # Modul penerimaan data sensor
│   │   ├── prediction/                # Modul prediksi & integrasi ML
│   │   ├── notification/              # Modul notifikasi penyiraman
│   │   ├── riwayat/                   # Modul riwayat pembacaan
│   │   ├── auth/                      # Autentikasi (JWT)
│   │   └── users/                     # Manajemen pengguna
│   └── package.json
│
├── 📁 ui/                              # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── dashboard/             # Dashboard utama
│   │   │   ├── prediksi/              # Halaman prediksi
│   │   │   ├── riwayat/               # Riwayat data sensor
│   │   │   ├── notifikasi/            # Halaman notifikasi
│   │   │   └── sensor/                # Data sensor live
│   │   ├── components/                # Komponen reusable
│   │   └── services/                  # Pemanggilan API
│   └── package.json
│
├── 📁 Dataset/                         # Kode pengumpulan dataset
│   ├── Dataset.ino                    # Sketch Arduino untuk logging
│   └── esp32.cpp                      # Modul ESP32 untuk dataset
│
├── 📁 simulate_test/                   # Simulasi pengiriman data IoT
│   └── simulate-iot.js                # Script Node.js untuk testing
│
└── docker-compose.yml                  # Konfigurasi MySQL via Docker
```

---

## 🤖 Model Machine Learning

### Dua Mode Inferensi

Sistem ini mengimplementasikan strategi **inferensi ganda** (*dual inference*):

#### 1. On-Device (ESP32-S3 Lokal)
- Model **Random Forest** diekspor ke C++ menggunakan library **Eloquent ML**
- Disimpan dalam file `model_local.h` dan di-compile langsung ke firmware
- Input: `temp`, `hum`, `soil_raw`, `moisture_percent`
- Output: Label `0` (Normal) atau `1` (Kering / Butuh Siram)
- Keunggulan: Bekerja tanpa koneksi internet, latensi sangat rendah

#### 2. Cloud ML Server (FastAPI)
- Model **scikit-learn** (`model_farming.pkl`) di-deploy ke Railway
- Endpoint: `POST /predict`
- Input JSON: `{ "temp": float, "hum": float, "soil": float }`
- Output: Status tanah, rekomendasi siram, dan keterangan
- NestJS backend memanggil ML server ini sebagai fallback/verifikasi

### Label Prediksi

| Kode Label | Status Tanah | Rekomendasi |
|---|---|---|
| `0` | Normal / Basah | Tidak perlu disiram |
| `1` | Kering | Tanaman perlu disiram segera |

---

## 🔌 Hardware & Wiring

### Komponen

| Komponen | Jumlah |
|---|---|
| ESP32-S3 DevKitC-1 | 1 |
| Sensor DHT11 | 1 |
| Sensor Soil Moisture (Analog) | 1 |
| Kabel Jumper | Secukupnya |

### Konfigurasi Pin

| Sensor | Pin ESP32-S3 | Keterangan |
|---|---|---|
| DHT11 (Data) | GPIO 4 | ⚠️ Gunakan GPIO4, bukan GPIO6 (strapping pin) |
| Soil Moisture (AO) | GPIO 5 | Input analog 12-bit (0–4095) |

> **⚠️ Catatan Penting:** GPIO6 pada ESP32-S3 adalah strapping pin yang dapat menyebabkan konflik pembacaan DHT11. Selalu gunakan **GPIO4** untuk koneksi DHT11.

### Formula Konversi Moisture

```cpp
// ADC 12-bit: 0 = basah, 4095 = kering
int moisture = (int)constrain(map(soilRaw, 4095, 0, 0, 100), 0, 100);
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- [PlatformIO](https://platformio.org/) (untuk firmware ESP32)
- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.9+
- [Docker](https://www.docker.com/) & Docker Compose
- Akun [Railway](https://railway.app/) (untuk deploy cloud)

---

### 1. Database (MySQL via Docker)

```bash
# Jalankan MySQL container
docker-compose up -d

# Database: caas_agriculture_db
# User: zona / Password: caas_zona_103012430010
# Port: 3306
```

---

### 2. ML Server (FastAPI)

```bash
cd "Project Smart Farming"

# Install dependensi
pip install -r requirements.txt

# Jalankan server lokal
uvicorn main2:app --host 0.0.0.0 --port 8000 --reload

# API tersedia di: http://localhost:8000
# Dokumentasi: http://localhost:8000/docs
```

**Contoh request ke `/predict`:**
```json
POST /predict
{
  "temp": 28.5,
  "hum": 65.0,
  "soil": 2100.0
}
```

**Contoh response:**
```json
{
  "success": true,
  "data_sensor": { "suhu": 28.5, "kelembapan_udara": 65.0, "kelembapan_tanah": 2100.0 },
  "hasil_prediksi": {
    "kode_label": 1,
    "status_tanah": "Kering",
    "rekomendasi_siram": true,
    "keterangan": "Tanaman perlu disiram"
  }
}
```

---

### 3. Backend NestJS

```bash
cd backend

# Install dependensi
npm install

# Buat file .env
cp .env.example .env
# Isi variabel: DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, ML_API_URL

# Jalankan development server
npm run start:dev

# API tersedia di: http://localhost:3000
```

**Variabel `.env` yang diperlukan:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=zona
DB_PASSWORD=caas_zona_103012430010
DB_NAME=caas_agriculture_db
JWT_SECRET=your_jwt_secret_here
ML_API_URL=http://localhost:8000
```

---

### 4. Frontend React

```bash
cd ui

# Install dependensi
npm install

# Jalankan development server
npm run dev

# Buka: http://localhost:5173
```

---

### 5. Firmware ESP32-S3

1. Buka folder `firmware/` di PlatformIO
2. Sesuaikan konfigurasi WiFi di `src/main.cpp`:
   ```cpp
   const char ssid[]     = "NAMA_WIFI_KAMU";
   const char password[] = "PASSWORD_WIFI";
   const char* serverUrl = "https://URL_BACKEND_KAMU/sensor/data";
   ```
3. Build dan upload ke board:
   ```bash
   pio run --target upload
   pio device monitor  # Untuk melihat Serial output
   ```

---

## 🌐 Endpoint API

### Backend NestJS

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/sensor/data` | Terima data dari ESP32 |
| `GET` | `/sensor/dashboard` | Data ringkasan dashboard |
| `GET` | `/riwayat` | Riwayat pembacaan sensor |
| `GET` | `/notification` | Daftar notifikasi |
| `POST` | `/prediction` | Minta prediksi manual |
| `POST` | `/auth/login` | Login pengguna |
| `POST` | `/auth/register` | Registrasi pengguna |

### ML Server FastAPI

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/predict` | Prediksi kondisi tanah |

---

## 📊 Dashboard Web

Dashboard menampilkan:

| Halaman | Konten |
|---|---|
| **Dashboard** | Ringkasan kondisi terkini, status sensor, rekomendasi siram |
| **Prediksi** | Input manual untuk mendapatkan prediksi AI |
| **Riwayat** | Tabel dan grafik data historis sensor |
| **Notifikasi** | Daftar notifikasi waktu penyiraman |
| **Sensor** | Data sensor real-time |

---

## 👥 Tim Pengembang

| Nama | NIM | Kontribusi |
|---|---|---|
| *(Isi nama anggota tim)* | *(Isi NIM)* | *(Isi kontribusi)* |

---

## 📚 Referensi & Library

**Firmware:**
- [Adafruit DHT Sensor Library](https://github.com/adafruit/DHT-sensor-library)
- [ArduinoJson](https://arduinojson.org/)
- [Eloquent ML](https://eloquentarduino.com/)

**Backend:**
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [Passport JWT](https://www.passportjs.org/)

**ML Server:**
- [FastAPI](https://fastapi.tiangolo.com/)
- [scikit-learn](https://scikit-learn.org/)

**Frontend:**
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router DOM](https://reactrouter.com/)

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **Tugas Akademik** — Mata Kuliah IoT + Machine Learning.

---

*CaAs Agriculture — Smart Farming System © 2025*
