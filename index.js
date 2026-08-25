require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const { tiktokDl } = require('./scrapers/tiktok');
const { igDl } = require('./scrapers/instagram');
const { ytDl } = require('./scrapers/youtube');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const tools = {
  game: [
    { icon: '<i data-lucide="worm"></i>', name: 'Snake', sub: 'Kumpulin skor', badge: 'MAIN', open: 'snake' },
    { icon: '<i data-lucide="list-ordered"></i>', name: '2048', sub: 'Gabung angka', badge: 'MAIN', open: 'g2048' },
    { icon: '<i data-lucide="arrow-up-down"></i>', name: 'Gravity Flip', sub: 'Balik gravitasi, hindari duri', badge: 'BARU', open: 'gravity' },
    { icon: '<i data-lucide="brain"></i>', name: 'Otak Kilat', sub: 'Hafalin pola makin cepat', badge: 'BARU', open: 'otak' },
    { icon: '<i data-lucide="target"></i>', name: 'Ketuk Refleks', sub: 'Tap sebelum waktu habis', badge: 'BARU', open: 'reflex' },
    { icon: '<i data-lucide="layers"></i>', name: 'Stack Tower', sub: 'Susun balok setinggi mungkin', badge: 'BARU', open: 'stack' },
    { icon: '<i data-lucide="bird"></i>', name: 'Flappy Blok', sub: 'Tap buat terbang, hindari pipa', badge: 'BARU', open: 'flappy' },
    { icon: '<i data-lucide="hammer"></i>', name: 'Tepuk Tikus', sub: 'Pukul tikus sebelum kabur', badge: 'BARU', open: 'mole' },
    { icon: '<i data-lucide="layout-grid"></i>', name: 'Cocok Kartu', sub: 'Ingat posisi, cocokkan pasangan', badge: 'BARU', open: 'memory' },
    { icon: '<i data-lucide="cherry"></i>', name: 'Iris Buah', sub: 'Geser buat iris, hindari bom', badge: 'BARU', open: 'fruit' },
    { icon: '<i data-lucide="calculator"></i>', name: 'Hitung Cepat', sub: 'Jawab soal matematika secepatnya', badge: 'BARU', open: 'math' },
    { icon: '<i data-lucide="footprints"></i>', name: 'Lari Dino', sub: 'Lompatin kaktus, jangan nabrak', badge: 'BARU', open: 'dino' },
    { icon: '🧱', name: 'Pecah Bata', sub: 'Pantulkan bola, hancurkan semua bata', badge: 'BARU', open: 'brick' },
    { icon: '🚀', name: 'Hindari Meteor', sub: 'Geser kapal, hindari meteor jatuh', badge: 'BARU', open: 'meteor' },
    { icon: '🧩', name: 'Puzzle Geser', sub: 'Urutkan angka 1-8 secepat mungkin', badge: 'BARU', open: 'puzzle' },
    { icon: '🎈', name: 'Balon Meletus', sub: 'Tap balon, jangan kena bom', badge: 'BARU', open: 'balloon' },
    { icon: '🔤', name: 'Susun Kata', sub: 'Susun huruf acak jadi kata benar', badge: 'BARU', open: 'word' },
    { icon: '🎹', name: 'Tap Ubin', sub: 'Tap ubin hitam sebelum kelewatan', badge: 'BARU', open: 'piano' }
  ],
  downloader: [
    { icon: '<i data-lucide="instagram"></i>', name: 'Instagram', sub: 'Download video & foto', badge: 'HD', open: 'dl-instagram', platform: 'instagram' },
    { icon: '<i data-lucide="music-2"></i>', name: 'TikTok', sub: 'No watermark', badge: 'MP4', open: 'dl-tiktok', platform: 'tiktok' },
    { icon: '<svg viewBox="0 0 24 24" width="22" height="22"><rect width="24" height="24" rx="6" fill="#FF0000"/><path d="M9.5 8.3v7.4c0 .5.55.8 1 .55l6.4-3.7c.44-.26.44-.9 0-1.15l-6.4-3.7c-.45-.26-1 .05-1 .55z" fill="#fff"/></svg>', name: 'YouTube', sub: 'Video & audio HD', badge: 'MP4/MP3', open: 'dl-youtube', platform: 'youtube' }
  ]
};

app.get('/', (req, res) => {
  res.render('index', { tools });
});

app.post('/api/download', express.json(), async (req, res) => {
  // Menangkap type dan quality yang dikirim khusus dari YouTube
  const { platform, url, type, quality } = req.body || {};

  if (!url) {
    return res.status(400).json({ ok: false, message: 'URL belum diisi.' });
  }

  try {
    let result;
    
    if (platform === 'tiktok') {
      result = await tiktokDl(url);
    } else if (platform === 'instagram') {
      result = await igDl(url);
    } else if (platform === 'youtube') {
      // Jalankan fungsi ytDl dengan membawa parameter type dan quality
      result = await ytDl(url, type, quality);
    } else {
      return res.status(400).json({ ok: false, message: `Scraper untuk ${platform} belum dipasang.` });
    }

    return res.json({ ok: true, data: result });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message || `Gagal mengambil data ${platform}.` });
  }
});

// Proxy download (Tersedia sebagai cadangan jika dibutuhkan oleh frontend)
app.get('/api/proxy-download', async (req, res) => {
  const { url, filename, type } = req.query;

  if (!url) {
    return res.status(400).send('URL kosong.');
  }

  try {
    const response = await axios.get(url, { 
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const ext = type === 'audio' ? 'mp3' : (type === 'image' ? 'jpg' : 'mp4');
    const safeName = (filename || 'download').replace(/[^a-z0-9_\-]/gi, '_');

    res.setHeader('Content-Disposition', `attachment; filename="VIP-Tools-${safeName}.${ext}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

    response.data.pipe(res);
  } catch (e) {
    console.error("Proxy Download Error:", e.message);
    res.status(500).send('Gagal mengambil file.');
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`VIP Tools jalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
