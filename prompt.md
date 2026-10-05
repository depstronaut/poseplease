Lanjutkan project "Pose Please" (Next.js, MediaPipe, skor sudut sendi dari tahap 1). Ubah jadi multiplayer real-time dengan room code. UI boleh polos dulu, fokus ke logika dan stabilitas.

STRUKTUR
Jadikan monorepo (npm workspaces):
- apps/web (Next.js yang sekarang)
- apps/server (Node + TypeScript + Colyseus)
- packages/shared (tipe, konstanta, angles.ts, score.ts, pindahkan dari web)
Server dan client memakai angles.ts dan score.ts yang sama dari packages/shared.

ALUR GAME
1. Lobby: pemain isi nickname, lalu "Create room" (dapat kode 4 huruf kapital, tanpa huruf mirip seperti I/O/0) atau "Join" dengan kode. Max 8 pemain. Pemain pertama jadi host dan bisa menekan Start (minimal 2 pemain, tapi beri flag dev untuk mengizinkan 1 pemain). Kalau host keluar, host pindah otomatis ke pemain tertua.
2. Game terdiri dari N ronde (default 5, host bisa pilih 3/5/8). Tiap ronde ada SATU pose target yang sama untuk semua pemain, diambil acak dari poses.json tanpa pengulangan dalam satu game.
3. Dalam satu ronde pemain GANTIAN:
   - ROUND_INTRO (3 detik): tampilkan pose target ke semua orang.
   - Untuk tiap pemain secara berurutan: TURN_COUNTDOWN (3 detik) → TURN_ACTIVE (5 detik, hanya pemain aktif yang kameranya menentukan skor) → TURN_RESULT (2 detik, tampil skor).
   - Setelah semua pemain selesai: ROUND_RESULT (ranking ronde + total poin sementara).
4. Setelah ronde terakhir: FINAL_RESULT (leaderboard, tombol "Play again" yang kembali ke lobby dengan room yang sama).
5. Urutan giliran diacak tiap ronde.

SKOR PER GILIRAN
- Selama TURN_ACTIVE, ambil nilai terbaik dari rata-rata bergerak 1 detik (jangan puncak sesaat, supaya tahan jitter).
- Poin giliran = nilai itu (0-100), ditambah bonus kecil untuk 3 teratas di ronde itu.

SINKRONISASI (PENTING)
- Pemain aktif mengirim LANDMARK badan atas (11-16 + hidung, dibulatkan 2 desimal) ke server sekitar 12-15 kali per detik. TIDAK ADA video yang dikirim.
- Server menghitung skor memakai packages/shared (jangan percaya skor dari client). Server menyiarkan landmark pemain aktif ke semua pemain lain, jadi penonton melihat skeleton pemain aktif bergerak live beserta skornya.
- Server yang memegang state machine dan timer (autoritatif). Client hanya merender state.
- Validasi di server: hanya pemain aktif yang boleh mengirim landmark, batasi laju pesan, tolak nilai di luar rentang.

KETAHANAN
- Pemain disconnect saat giliran: giliran dilewati (skor 0), beri waktu reconnect 15 detik memakai token sesi.
- Pemain yang menolak izin kamera: tetap bisa gabung sebagai penonton, giliran dilewati.
- Room otomatis dihapus kalau kosong.

CLIENT
- Halaman: / (buat/gabung room), /room/[code] (lobby + game, semua fase di satu halaman berdasarkan state).
- Pakai colyseus.js. Alamat server dari env NEXT_PUBLIC_SERVER_URL.
- Kamera dan MediaPipe hanya dinyalakan saat giliran pemain itu (hemat baterai).

BATASAN
- Belum ada database, akun, atau leaderboard global. State room cukup di memori.
- Jangan ubah tampilan lebih dari yang perlu, UI akan didesain ulang di tahap berikutnya.
- Jangan tambah library di luar Colyseus, colyseus.js, dan test runner.

KRITERIA SELESAI
- npm run dev menjalankan web dan server bersamaan.
- Dua tab/browser berbeda bisa buat dan gabung room lewat kode, main satu game penuh dengan giliran bergantian, dan penonton melihat skeleton pemain aktif.
- Unit test untuk state machine giliran dan fungsi skor.
- README singkat: cara menjalankan dan variabel env.

Sebelum coding, tulis rencana file dan alur state machine, lalu kerjakan bertahap.