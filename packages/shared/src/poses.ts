import type { TargetPose } from './types.ts';

export const POSES: TargetPose[] = [
  {
    id: "meme-absolute-cinema",
    nama: "Absolute Cinema",
    deskripsi: "Angkat kedua tangan sejajar kepala dengan telapak menghadap depan, tatapan khidmat/serius bak sutradara legendaris!",
    emoji: "🎬",
    gambar: "/memes/1.jpg",
    angles: {
      leftElbow: 90,
      rightElbow: 90,
      leftShoulder: -35,
      rightShoulder: -35,
      shoulderTilt: 0,
      headTilt: 0,
      handToFace: 40,
    }
  },
  {
    id: "meme-why-not",
    nama: "Why Not? (Shannon Sharpe)",
    deskripsi: "Buka kedua tangan lebar-lebar setinggi dada, telapak tangan terbuka ke atas, tersenyum lebar penuh percaya diri!",
    emoji: "🤷‍♂️",
    gambar: "/memes/2.jpg",
    angles: {
      leftElbow: 110,
      rightElbow: 110,
      leftShoulder: 45,
      rightShoulder: 45,
      shoulderTilt: 0,
      headTilt: 0,
    }
  },
  {
    id: "meme-who-me",
    nama: "Bukan Saya! (Who, Me?)",
    deskripsi: "Tunjuk dadamu sendiri dengan satu jari telunjuk, miringkan kepala dengan ekspresi kaget dan polos!",
    emoji: "🙋",
    gambar: "/memes/3.jpg",
    angles: {
      rightElbow: 50,
      rightShoulder: 35,
      headTilt: 14,
      handToChest: 85,
    }
  },
  {
    id: "meme-shocked",
    nama: "Kaget Berat (FlightReacts)",
    deskripsi: "Pegang kedua sisi belakang kepalamu, buka mata lebar-lebar, dan buka mulut menganga berbentuk O!",
    emoji: "😱",
    gambar: "/memes/4.jpg",
    angles: {
      leftElbow: 45,
      rightElbow: 45,
      leftShoulder: -20,
      rightShoulder: -20,
      shoulderTilt: 0,
      headTilt: 0,
      mouthOpen: 85,
      handToFace: 95,
    }
  },
  {
    id: "meme-mewing",
    nama: "Mewing / Shhh (Hening)",
    deskripsi: "Tempelkan satu jari telunjuk di depan bibir tanda diam (shhh), dagu tegak, tatapan tajam tanpa senyum!",
    emoji: "🤫",
    gambar: "/memes/5.jpg",
    angles: {
      rightElbow: 35,
      rightShoulder: 40,
      handToFace: 95,
      mouthOpen: 0,
    }
  },
  {
    id: "meme-roll-safe",
    nama: "Mikir Keras (Roll Safe)",
    deskripsi: "Ketukkan jari telunjuk ke pelipis kepala sambil tersenyum licik dan lirikan cerdik!",
    emoji: "🧠",
    gambar: "/memes/6.jpg",
    angles: {
      rightElbow: 38,
      rightShoulder: 25,
      headTilt: -10,
      handToFace: 90,
    }
  },
  {
    id: "meme-gangsta-duck",
    nama: "Gaya Jalanan (Gangsta Goose)",
    deskripsi: "Pose hip-hop asimetris: satu tangan naik ke atas dengan pose cadas, satu tangan ditekuk ke bawah, kepala mendongak!",
    emoji: "🦆",
    gambar: "/memes/7.jpg",
    angles: {
      leftElbow: 55,
      rightElbow: 130,
      leftShoulder: -15,
      rightShoulder: 50,
      shoulderTilt: -12,
      headTilt: 18,
    }
  },
  {
    id: "meme-cringe-kid",
    nama: "Jijik Banget (Cringe / Ew)",
    deskripsi: "Dorong kedua tangan ke bawah seolah menolak, miringkan kepala ke belakang dengan muka meringis jijik!",
    emoji: "😬",
    gambar: "/memes/8.jpg",
    angles: {
      leftElbow: 115,
      rightElbow: 115,
      leftShoulder: 65,
      rightShoulder: 65,
      shoulderTilt: 6,
      headTilt: -16,
      mouthOpen: 40,
    }
  },
  {
    id: "meme-peace-baby",
    nama: "Double Peace (Melet Imut)",
    deskripsi: "Angkat kedua tangan pose peace (V) di samping pipi, miringkan kepala dan pasang muka gemas / melet!",
    emoji: "✌️",
    gambar: "/memes/9.jpg",
    angles: {
      leftElbow: 50,
      rightElbow: 50,
      leftShoulder: 20,
      rightShoulder: 20,
      shoulderTilt: 0,
      headTilt: 18,
      handToFace: 85,
      mouthOpen: 50,
    }
  },
  {
    id: "meme-heart-hands",
    nama: "Heart Hands (Saranghae)",
    deskripsi: "Satukan kedua tangan membentuk simbol cinta (hati) persis di depan dada, tersenyum manis!",
    emoji: "🫶",
    gambar: "/memes/10.jpg",
    angles: {
      leftElbow: 65,
      rightElbow: 65,
      leftShoulder: 45,
      rightShoulder: 45,
      shoulderTilt: 0,
      headTilt: 8,
      handCloseness: 95,
    }
  },
  {
    id: "meme-stop-cole",
    nama: "Tunggu Dulu (Hold Up / J. Cole)",
    deskripsi: "Julurkan satu telapak tangan terbuka lurus ke arah kamera (isyarat stop), tatap tajam dengan gaya santai!",
    emoji: "✋",
    gambar: "/memes/11.jpg",
    angles: {
      rightElbow: 145,
      rightShoulder: 45,
      headTilt: -8,
    }
  }
];
