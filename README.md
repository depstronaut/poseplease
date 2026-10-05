# PosePlease 📸 — Multiplayer Real-Time Meme Pose Game

Prototype game web multiplayer real-time tiru pose meme menggunakan **Next.js (App Router)**, **MediaPipe PoseLandmarker (WASM)**, dan **Colyseus WebSocket Server**.

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- Node.js >= v20 (Direkomendasikan Node.js v22 atau v24)
- npm >= v10

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Game (Web + Server Bersamaan)
```bash
npm run dev
```
Perintah ini akan menyalakan:
- **Server Colyseus** di `http://localhost:2567` (WebSocket: `ws://localhost:2567`)
- **Web Client Next.js** di `http://localhost:3000`

Buka browser di **`http://localhost:3000`** untuk mulai bermain!

### 4. Menjalankan Unit Tests
```bash
npm test
```
Menjalankan pengujian untuk kalkulasi sudut sendi, toleransi skor, 1s rolling average, dan state machine giliran.

---

## ⚙️ Variabel Lingkungan (Environment Variables)

### Client (`apps/web/.env.local`)
| Variabel | Default | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | `ws://localhost:2567` | URL WebSocket server Colyseus |

### Server (`apps/server/.env`)
| Variabel | Default | Keterangan |
|---|---|---|
| `PORT` | `2567` | Port server Colyseus |

---

## 🎮 Aturan & Alur Permainan

1. **Lobby**:
   - Pemain mengisi nickname lalu memilih **"Buat Room Baru"** (akan mendapatkan kode 4 huruf kapital unik) atau **"Gabung Room"** dengan kode 4 huruf.
   - Maksimal 8 pemain per room.
   - Host dapat memilih jumlah ronde (3, 5, atau 8 ronde) dan dapat mengaktifkan **Mode Dev (1 Pemain)** untuk testing solo.
2. **Ronde Permainan (Bergiliran)**:
   - **ROUND_INTRO (3s)**: Pose target acak diumumkan ke semua pemain. Urutan giliran diacak.
   - **TURN_COUNTDOWN (3s)**: Pemain aktif bersiap di depan kamera (kamera hanya menyala saat giliran aktif untuk menghemat baterai).
   - **TURN_ACTIVE (5s)**: Pemain aktif mengirim landmark sendi badan atas (15 Hz). Server menghitung nilai terbaik dari **rata-rata bergerak 1 detik (1s rolling average)**.
   - **TURN_RESULT (2s)**: Skor giliran pemain ditampilkan ke semua penonton.
   - **ROUND_RESULT (4s)**: Peringkat ronde diumumkan beserta bonus top 3 (+15, +10, +5 poin).
3. **Klasemen Akhir (FINAL_RESULT)**:
   - Pemenang dinobatkan dan Host dapat menekan **"Play Again"** untuk kembali ke Lobby bersama pemain di room yang sama.
